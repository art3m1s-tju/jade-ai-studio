import io
import base64
import os
import tempfile
from pathlib import Path
from urllib.parse import unquote, urlparse
import dashscope
import requests
from dashscope import ImageSynthesis, Generation, MultiModalConversation

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

app = FastAPI(title="Jade AI Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LOCAL_REFERENCE_FALLBACKS = {
    "Jade_Bi": "public/gallery/jade-bi-disc.jpg",
    "Jade%20Bi": "public/gallery/jade-bi-disc.jpg",
    "Liangzhu": "public/gallery/liangzhu-jade-cong.jpg",
    "Hongshan": "public/gallery/hongshan-jade-dragon.jpg",
    "Jade_Dragon": "public/gallery/hongshan-jade-dragon.jpg",
    "Cicada": "public/gallery/han-jade-cicada.jpg",
}

LOCAL_ENV_FILE = PROJECT_ROOT / ".env.local"


def _load_local_env():
    if not os.path.exists(LOCAL_ENV_FILE):
        return
    with open(LOCAL_ENV_FILE, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key and value and key not in os.environ:
                os.environ[key] = value


_load_local_env()
if os.environ.get("DASHSCOPE_API_KEY"):
    dashscope.api_key = os.environ["DASHSCOPE_API_KEY"]


# ── Models ──────────────────────────────────────────────────────────

class ReferenceImage(BaseModel):
    url: str
    fallback_url: str = ""
    role: str = "shape"
    title: str = ""
    instruction: str = ""


class PatternRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    patterns: list[str] = Field(default_factory=list)
    forms: list[str] = Field(default_factory=list)
    color: str = ""
    mode: str = "text_to_image"
    model: str = "wan2.5-i2i-preview"
    size: str = "1024*1024"
    n: int = 1
    watermark: bool = False
    reference_images: list[ReferenceImage] = Field(default_factory=list)


class AudioRequest(BaseModel):
    text: str
    id: int


class ApiKeyRequest(BaseModel):
    api_key: str
    persist: bool = True


# ── Local Configuration ─────────────────────────────────────────────

@app.get("/api/config/status")
async def config_status():
    return {"dashscope_configured": bool(os.environ.get("DASHSCOPE_API_KEY"))}


@app.post("/api/config/dashscope-key")
async def set_dashscope_key(req: ApiKeyRequest):
    api_key = req.api_key.strip()
    if len(api_key) < 20:
        raise HTTPException(status_code=400, detail="API Key 格式过短")

    os.environ["DASHSCOPE_API_KEY"] = api_key
    dashscope.api_key = api_key

    if req.persist:
        _write_local_env_key(api_key)

    return {"ok": True, "persisted": req.persist}


def _write_local_env_key(api_key: str):
    lines = []
    if os.path.exists(LOCAL_ENV_FILE):
        with open(LOCAL_ENV_FILE, "r", encoding="utf-8") as file:
            lines = [line for line in file.readlines() if not line.startswith("DASHSCOPE_API_KEY=")]
    lines.append(f"DASHSCOPE_API_KEY={api_key}\n")
    with open(LOCAL_ENV_FILE, "w", encoding="utf-8") as file:
        file.writelines(lines)


# ── Jade Pattern Generation ─────────────────────────────────────────

@app.post("/api/generate-pattern")
async def generate_pattern(req: PatternRequest):
    try:
        if req.reference_images:
            reference_count = len(req.reference_images)
            try:
                result = _call_reference_generation(req)
                mode = "image_reference"
                model = req.model
            except HTTPException:
                result = _call_text_generation(req)
                mode = "text_to_image_fallback"
                model = "wanx-v1"
                req.reference_images = []
            image_url = _extract_image_url(result)
        else:
            reference_count = 0
            result = _call_text_generation(req)
            image_url = _extract_image_url(result)
            model = "wanx-v1"
            mode = "text_to_image"

        try:
            analysis = await _analyze_pattern_elements(req)
        except Exception:
            analysis = _fallback_pattern_analysis(req)

        return {
            "image_url": image_url,
            "image_urls": [image_url],
            "analysis": analysis,
            "model": model,
            "mode": mode,
            "request_id": getattr(result, "request_id", ""),
            "reference_count": reference_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _call_text_generation(req: PatternRequest):
    result = ImageSynthesis.call(
        model="wanx-v1",
        prompt=req.prompt,
        negative_prompt=req.negative_prompt or None,
        n=max(1, min(req.n, 4)),
        size=req.size if "*" in req.size else "1024*1024",
    )
    _raise_dashscope_error(result)
    return result


def _call_reference_generation(req: PatternRequest):
    prompt = _build_reference_prompt(req)
    temp_files = []
    try:
        images = []
        for item in req.reference_images[:3]:
            image_path, is_temporary = _download_reference_image(item.url, item.fallback_url)
            if is_temporary:
                temp_files.append(image_path)
            images.append(f"file://{image_path}")

        result = ImageSynthesis.call(
            model=req.model or "wan2.5-i2i-preview",
            prompt=prompt,
            images=images,
            negative_prompt=req.negative_prompt or None,
            n=max(1, min(req.n, 4)),
            size=req.size if req.size else "1024*1024",
            watermark=req.watermark,
        )
        _raise_dashscope_error(result)
        return result
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass


def _build_reference_prompt(req: PatternRequest) -> str:
    reference_notes = []
    for index, item in enumerate(req.reference_images[:3], start=1):
        role = {
            "shape": "器型轮廓",
            "pattern": "纹饰细节",
            "material": "玉质与色泽",
            "style": "整体风格",
        }.get(item.role, item.role)
        note = _normalize_reference_instruction(item.instruction, index) or f"严格参考图{index}的{role}。"
        reference_notes.append(f"图{index}（{role}）：{note}")

    negative = req.negative_prompt.replace(",", "，") if req.negative_prompt else ""
    avoid_text = f"必须避免：{negative}。" if negative else ""
    return "\n".join([
        "请基于输入参考图生成一件新的中国古代玉器设计，参考相似度优先于自由发挥。",
        "需要高度保留参考图的器型比例、玉石材质、雕刻厚薄、边缘透光与博物馆实物摄影质感。",
        *reference_notes,
        req.prompt,
        avoid_text,
        "最终画面只出现一件玉器，黑色或深色博物馆展陈背景，真实透闪石/和田玉质感，温润蜡状光泽，不能像塑料、陶瓷、金属、玩具或卡通模型。",
    ])


def _normalize_reference_instruction(instruction: str, index: int) -> str:
    if not instruction:
        return ""
    return instruction.replace("Image 1", f"图{index}").replace("Image 2", f"图{index}").replace("Image 3", f"图{index}")


def _resolve_image_url(url: str) -> str:
    commons_url = _resolve_commons_file_url(url)
    if commons_url:
        return commons_url

    headers = {"User-Agent": "JadeAIStudio/1.0 (educational project)"}
    try:
        response = requests.head(url, allow_redirects=True, timeout=10, headers=headers)
        if response.ok and response.url:
            return response.url
    except requests.RequestException:
        try:
            response = requests.get(url, allow_redirects=True, stream=True, timeout=15, headers=headers)
            response.close()
            if response.ok and response.url:
                return response.url
        except requests.RequestException:
            pass
    return url


def _download_reference_image(url: str, fallback_url: str = "") -> tuple[str, bool]:
    local_path = _local_reference_path(url)
    if local_path:
        return local_path, False

    resolved_url = _resolve_image_url(url)
    headers = {"User-Agent": "JadeAIStudio/1.0 (educational project)"}
    try:
        response = requests.get(resolved_url, stream=True, timeout=30, headers=headers)
        response.raise_for_status()
    except requests.RequestException as exc:
        fallback_path = _local_reference_path(fallback_url)
        if fallback_path:
            return fallback_path, False
        local_path = _local_reference_path(resolved_url)
        if local_path:
            return local_path, False
        raise HTTPException(status_code=500, detail=f"参考图下载失败：{resolved_url}") from exc

    content_type = response.headers.get("content-type", "").lower()
    if content_type and not content_type.startswith("image/"):
        fallback_path = _local_reference_path(fallback_url)
        if fallback_path:
            return fallback_path, False
        raise HTTPException(status_code=500, detail="参考图不是有效图片")

    suffix = ".jpg"
    if "png" in content_type:
        suffix = ".png"
    elif "webp" in content_type:
        suffix = ".webp"
    elif "bmp" in content_type:
        suffix = ".bmp"

    total = 0
    fd, path = tempfile.mkstemp(prefix="jade-ref-", suffix=suffix)
    with os.fdopen(fd, "wb") as file:
        for chunk in response.iter_content(chunk_size=1024 * 256):
            if not chunk:
                continue
            total += len(chunk)
            if total > 10 * 1024 * 1024:
                os.remove(path)
                fallback_path = _local_reference_path(fallback_url)
                if fallback_path:
                    return fallback_path, False
                raise HTTPException(status_code=500, detail="参考图超过 10MB，无法用于生成")
            file.write(chunk)

    if total == 0:
        os.remove(path)
        raise HTTPException(status_code=500, detail="参考图下载为空")
    return path, True


def _local_reference_path(url: str) -> str:
    if url.startswith("/"):
        path = PROJECT_ROOT / "public" / url.lstrip("/")
        return str(path) if path.exists() else ""

    if url.startswith("file://"):
        path = Path(url.replace("file://", "", 1))
        return str(path) if path.exists() else ""

    if not urlparse(url).scheme:
        path = PROJECT_ROOT / url
        return str(path) if path.exists() else ""

    normalized = url.replace(" ", "_")
    for marker, path in LOCAL_REFERENCE_FALLBACKS.items():
        if marker in normalized:
            full_path = PROJECT_ROOT / path
            if full_path.exists():
                return str(full_path)
    return ""


def _fallback_pattern_analysis(req: PatternRequest) -> str:
    parts = []
    if req.forms:
        parts.append(f"器型以{'、'.join(req.forms)}为主")
    if req.patterns:
        parts.append(f"纹饰融合{'、'.join(req.patterns)}")
    if req.color:
        parts.append(f"玉色倾向{req.color}")
    summary = "，".join(parts) if parts else "该作品以传统玉器为灵感"
    return f"{summary}。画面重点呈现中国古代玉器的器型秩序、温润玉质与博物馆展陈质感，可作为后续细化纹饰、材质和时代风格的生成方案参考。"


def _resolve_commons_file_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.netloc != "commons.wikimedia.org":
        return ""

    marker = "/wiki/Special:Redirect/file/"
    if marker not in parsed.path:
        return ""

    file_name = unquote(parsed.path.split(marker, 1)[1])
    try:
        response = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "format": "json",
                "prop": "imageinfo",
                "iiprop": "url",
                "iiurlwidth": "1024",
                "titles": f"File:{file_name}",
            },
            headers={"User-Agent": "JadeAIStudio/1.0 (educational project)"},
            timeout=15,
        )
        response.raise_for_status()
        pages = response.json().get("query", {}).get("pages", {})
        for page in pages.values():
            imageinfo = page.get("imageinfo") or []
            if imageinfo and (imageinfo[0].get("thumburl") or imageinfo[0].get("url")):
                return imageinfo[0].get("thumburl") or imageinfo[0]["url"]
    except (requests.RequestException, ValueError, KeyError):
        return ""
    return ""


def _raise_dashscope_error(result):
    if getattr(result, "status_code", 200) != 200:
        message = getattr(result, "message", "Dashscope image generation failed")
        code = getattr(result, "code", "")
        raise HTTPException(status_code=500, detail=f"{code} {message}".strip())

    output = _safe_get(result, "output")
    task_status = _safe_get(output, "task_status")
    if task_status == "FAILED":
        code = _safe_get(output, "code") or "TaskFailed"
        message = _safe_get(output, "message") or "Dashscope image generation task failed"
        raise HTTPException(status_code=500, detail=f"{code} {message}".strip())


def _extract_image_url(result):
    output = _safe_get(result, "output")
    if output is None and isinstance(result, dict):
        output = result.get("output", {})

    results = _safe_get(output, "results") if output is not None else None
    if results is None and isinstance(output, dict):
        results = output.get("results")
    if results:
        first = results[0]
        return first.get("url") if isinstance(first, dict) else first.url

    choices = _safe_get(output, "choices") if output is not None else None
    if choices is None and isinstance(output, dict):
        choices = output.get("choices")
    if choices:
        content = choices[0].get("message", {}).get("content", []) if isinstance(choices[0], dict) else choices[0].message.content
        for item in content:
            image = item.get("image") if isinstance(item, dict) else getattr(item, "image", None)
            if image:
                return image

    raise HTTPException(status_code=500, detail="生成服务未返回图片地址")


def _safe_get(obj, key):
    try:
        return getattr(obj, key)
    except (AttributeError, KeyError, TypeError):
        if isinstance(obj, dict):
            return obj.get(key)
        return None


async def _analyze_pattern_elements(req: PatternRequest) -> str:
    parts = []
    if req.patterns:
        parts.append(f"融合传统纹样：{'、'.join(req.patterns)}")
    if req.forms:
        parts.append(f"器型参考：{'、'.join(req.forms)}")
    if req.color:
        parts.append(f"玉色基调：{req.color}")

    element_info = "；".join(parts) if parts else "AI自由创作"

    response = Generation.call(
        model="qwen-plus",
        messages=[{
            "role": "user",
            "content": f"""你是一位中国玉文化专家。请为以下AI生成的玉器纹样设计写一段"纹样基因解析"（150-200字），分析其中可能融合的传统元素。

该设计包含以下元素：{element_info}

请从以下维度解析：
1. 纹样基因：识别其中的传统纹样元素（云纹、雷纹、龙纹、凤纹、谷纹等）
2. 器型传承：判断参考的传统器型及其文化含义
3. 审美特征：分析其美学风格（古朴/典雅/华美/简约等）
4. 文化内涵：阐述设计所承载的玉文化精神（如玉德思想、吉祥寓意等）

请用优美的中文撰写，兼具学术性和可读性。直接输出解析内容，不要标题前缀。"""
        }],
    )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.message)

    return response.output.text


# ── Jade Image Analysis ─────────────────────────────────────────────

JADE_ANALYSIS_PROMPT = """你是一位资深玉器鉴定专家和玉文化学者。请仔细分析这张玉器图片，按以下格式输出分析结果：

器型判断：<判断这是什么类型的玉器，如璧、琮、佩、环等>
年代推测：<根据器型、纹饰、工艺特征推测大致的年代范围>
材质判断：<判断玉质种类，如和田白玉、青玉、碧玉、岫岩玉等>
纹饰分析：<详细描述玉器上的纹饰类型、布局和风格特点>
工艺特征：<分析玉器的雕刻工艺，如阴刻、浮雕、镂雕、圆雕等>
文化寓意：<解读玉器所承载的文化内涵和象征意义>
历史价值：<简要评估该玉器在玉文化史中的地位和价值>

请直接用中文输出，每个字段2-3句话，语言专业而优美。如果图片不是玉器或不清晰，请诚实说明。"""


@app.post("/api/analyze-jade")
async def analyze_jade(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        img_base64 = base64.b64encode(contents).decode("utf-8")
        mime_type = image.content_type or "image/jpeg"
        img_url = f"data:{mime_type};base64,{img_base64}"

        messages = [
            {
                "role": "user",
                "content": [
                    {"image": img_url},
                    {"text": JADE_ANALYSIS_PROMPT},
                ],
            }
        ]

        response = MultiModalConversation.call(
            model="qwen-vl-max",
            messages=messages,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=response.message)

        content = response.output.choices[0].message.content
        if isinstance(content, list):
            text = "".join(item.get("text", "") if isinstance(item, dict) else item.text for item in content)
        else:
            text = content
        return _parse_analysis(text)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _parse_analysis(text: str) -> dict:
    fields = {
        "器型判断": "form",
        "年代推测": "era",
        "材质判断": "material",
        "纹饰分析": "pattern",
        "工艺特征": "craftsmanship",
        "文化寓意": "cultural_meaning",
        "历史价值": "historical_value",
    }
    result = {}
    for cn_key, en_key in fields.items():
        result[en_key] = _extract_field(text, cn_key)
    return result


def _extract_field(text: str, field_name: str) -> str:
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith(field_name) or line.startswith(field_name.replace("判断", "")):
            parts = line.split("：", 1) if "：" in line else line.split(":", 1)
            if len(parts) == 2:
                return parts[1].strip()
    return ""


# ── Audio Generation (TTS) ──────────────────────────────────────────

@app.post("/api/generate-audio")
async def generate_audio(req: AudioRequest):
    try:
        import edge_tts

        communicate = edge_tts.Communicate(req.text, "zh-CN-XiaoxiaoNeural")
        audio_data = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])

        audio_data.seek(0)
        return Response(
            content=audio_data.read(),
            media_type="audio/mpeg",
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Health Check ────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}
