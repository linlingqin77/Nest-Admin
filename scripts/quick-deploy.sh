#!/bin/bash

# 快速部署脚本 - 开发环境
# 使用方法: bash scripts/quick-deploy.sh

set -e

echo "🚀 快速部署 Nest Admin 开发环境..."
echo ""

# 检查依赖
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请运行: npm install -g pnpm"
    exit 1
fi

# 进入项目根目录
cd "$(dirname "$0")/.."

# 停止现有进程
echo "⏹️  停止现有进程..."
pkill -f "vite" || true
pkill -f "nest start" || true
sleep 2

# 启动前端
echo "🎨 启动前端开发服务器..."
cd admin-naive-ui
pnpm dev > /tmp/nest-admin-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端 PID: $FRONTEND_PID"
cd ..

# 等待一下
sleep 2

# 启动后端
echo "⚙️  启动后端开发服务器..."
cd server
pnpm run start:dev > /tmp/nest-admin-backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"
cd ..

# 保存 PID
echo $FRONTEND_PID > /tmp/nest-admin-frontend.pid
echo $BACKEND_PID > /tmp/nest-admin-backend.pid

echo ""
echo "✅ 部署完成！"
echo ""
echo "📍 服务地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000"
echo "   API:  http://localhost:3000/api"
echo ""
echo "📝 日志文件:"
echo "   前端: /tmp/nest-admin-frontend.log"
echo "   后端: /tmp/nest-admin-backend.log"
echo ""
echo "🛑 停止服务:"
echo "   bash scripts/stop-services.sh"
echo ""
