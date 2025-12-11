#!/bin/bash

# 后端快速启动脚本
# 使用方法: bash scripts/start-backend.sh

set -e

echo "⚙️  快速启动后端服务..."

# 进入后端目录
cd "$(dirname "$0")/../server"

# 停止现有进程
pkill -f "nest start.*server" || true
sleep 1

# 启动
pnpm run start:dev > /tmp/nest-admin-backend.log 2>&1 &
BACKEND_PID=$!

# 保存 PID
echo $BACKEND_PID > /tmp/nest-admin-backend.pid

echo ""
echo "✅ 后端服务已启动！"
echo ""
echo "📍 地址: http://localhost:3000"
echo "📄 API: http://localhost:3000/api"
echo "🆔 PID: $BACKEND_PID"
echo "📝 日志: tail -f /tmp/nest-admin-backend.log"
echo ""
echo "🛑 停止: bash scripts/stop-backend.sh"
echo ""
