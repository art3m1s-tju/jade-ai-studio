import io
import base64
import dashscope
from dashscope import ImageSynthesis, Generation, MultiModalConversation

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

app = FastAPI(title="Jade AI Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────

class PatternRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    patterns: list[str] = []
    forms: list[str] = []
    color: str = ""


class AudioRequest(BaseModel):
    text: str
    id: int


# ── Jade Pattern Generation ─────────────────────────────────────────

@app.post("/api/generate-pattern")
async def generate_pattern(req: PatternRequest):
    try:
        result = ImageSynthesis.call(
            model="wanx-v1",
            prompt=req.prompt,
            negative_prompt=req.negative_prompt or None,
            n=1,
            size="1024*1024",
        )
        if result.status_code != 200:
            raise HTTPException(status_code=500, detail=result.message)

        image_url = result.output.results[0].url

        analysis = await _analyze_pattern_elements(req)

        return {
            "image_url": image_url,
            "analysis": analysis,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
