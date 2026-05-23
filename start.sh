#!/bin/bash
# AI玉器纹样设计工作室 — 一键启动脚本
# 使用方法: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "================================================"
echo "  AI玉器纹样设计工作室 — Jade Pattern AI Studio"
echo "================================================"

# Check for .env file
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo ""
    echo "[WARNING] 未找到 .env 文件"
    echo "请复制 .env.example 为 .env 并填入API密钥:"
    echo "  cp .env.example .env"
    echo ""
fi

# Load env vars
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
    echo "[OK] 环境变量已加载"
fi

# Start backend
echo "[START] 启动后端服务 (FastAPI :8000)..."
cd "$SCRIPT_DIR/backend"
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
echo "[START] 启动前端服务 (Vite :5173)..."
cd "$SCRIPT_DIR"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo "================================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

# Cleanup on exit
cleanup() {
    echo ""
    echo "[STOP] 正在停止服务..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "[OK] 所有服务已停止"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
