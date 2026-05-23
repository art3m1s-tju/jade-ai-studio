# Jade AI Studio (中国玉文化与AI创作工坊)

> **Tongji University - "Chinese Jade and Jade Culture Appreciation" Course Final Project**
> 同济大学《中国玉石及玉文化鉴赏》课程大作业

**English Introduction:**
Jade AI Studio is an AI-powered platform dedicated to exploring, analyzing, and generating traditional Chinese jade patterns and artifacts. It bridges ancient cultural heritage with cutting-edge artificial intelligence, featuring AI-driven pattern generation, multi-modal jade artifact analysis, and a digital gallery.

**项目简介:**
本项目致力于将中国传统玉文化与现代人工智能技术相结合。通过引入 AIGC（人工智能生成内容）和多模态大模型技术，不仅能够根据用户的描述和传统纹样基因自动生成全新的玉器设计，还能对用户上传的真实玉器图片进行多维度的智能分析与鉴定。

## ✨ 核心功能 (Core Features)

1. **纹样生成 (AI Pattern Generator)**
   - 融合传统纹样（如云纹、雷纹、龙凤纹等）与玉色基调。
   - 调用阿里云通义万相（Wanx-v1）模型，一键生成独特玉器设计。
   - 结合 Qwen-plus 大语言模型，自动生成优美的“纹样基因解析”，剖析设计中的文化密码与美学特征。

2. **玉器解读 (AI Jade Analyzer)**
   - 用户可上传玉器图片，系统调用多模态大模型（Qwen-VL-Max）进行深度视觉分析。
   - 自动提取并生成关于器型、年代推测、材质、纹饰、工艺特征、文化寓意及历史价值的详细鉴定报告。
   - 结合 Edge-TTS 提供语音播报功能，让玉文化知识更加生动。

3. **数字展廊 (Digital Gallery)**
   - 沉浸式的数字玉器展厅，动态展示玉文化主题的设计和作品。

## 🛠️ 技术栈 (Tech Stack)

### 前端 (Frontend)
- **框架:** React 19 + Vite
- **样式:** Tailwind CSS 4 + 现代玻璃拟态 (Glassmorphism) UI 设计
- **动画:** Framer Motion

### 后端 (Backend)
- **框架:** FastAPI (Python)
- **AI 大模型:** 
  - [阿里云 Dashscope](https://help.aliyun.com/zh/model-studio/): `wanx-v1` (图像生成), `qwen-vl-max` (视觉理解), `qwen-plus` (文本解析)
- **语音服务:** `edge-tts` (文本转语音)

## 🚀 快速开始 (Getting Started)

### 1. 克隆项目
```bash
git clone https://github.com/art3m1s-tju/jade-ai-studio.git
cd jade-ai-studio
```

### 2. 后端配置与启动
后端运行需要 Python 环境，并配置阿里云 Dashscope API Key。

```bash
cd backend

# 创建并激活虚拟环境 (可选)
python -m venv .venv
source .venv/bin/activate  # Windows 用户使用 .venv\Scripts\activate

# 安装依赖项
pip install fastapi uvicorn dashscope edge-tts python-multipart pydantic

# 配置环境变量 (设置你的阿里云百炼 API Key)
export DASHSCOPE_API_KEY="your-api-key-here"

# 启动后端服务
uvicorn main:app --reload --port 8000
```

### 3. 前端配置与启动
```bash
# 回到项目根目录
cd ..

# 安装前端依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可体验。

## 📜 声明 (Disclaimer)

本项目仅作为课程大作业与技术探索，AI 生成的鉴定结果不具备任何法律或商业鉴定效力，请勿用于真实的文物交易与商业鉴定。

## 🤝 致谢 (Acknowledgements)
- 感谢同济大学《中国玉石及玉文化鉴赏》课程老师的悉心教导与启发。
- 感谢阿里云通义大模型提供的 API 支持。
