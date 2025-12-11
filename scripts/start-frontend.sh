#!/bin/bash

# 前端快速启动脚本
# 使用方法: bash scripts/start-frontend.sh

set -e

echo "🎨 快速启动前端服务..."

# 进入前端目录
cd "$(dirname "$0")/../admin-naive-ui"

# 停止现有进程
pkill -f "vite.*admin-naive-ui" || true
sleep 1

# 启动
pnpm dev > /tmp/nest-admin-frontend.log 2>&1 &
FRONTEND_PID=$!

# 保存 PID
echo $FRONTEND_PID > /tmp/nest-admin-frontend.pid

echo ""
echo "✅ 前端服务已启动！"
echo ""
echo "📍 地址: http://localhost:5173"
echo "🆔 PID: $FRONTEND_PID"
echo "📝 日志: tail -f /tmp/nest-admin-frontend.log"
echo ""
echo "🛑 停止: bash scripts/stop-frontend.sh"
echo ""
