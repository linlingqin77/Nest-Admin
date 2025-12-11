#!/bin/bash

# 停止服务脚本
# 使用方法: bash scripts/stop-services.sh

echo "🛑 停止 Nest Admin 服务..."
echo ""

# 停止通过 PID 文件记录的进程
if [ -f /tmp/nest-admin-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/nest-admin-frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    fi
    rm /tmp/nest-admin-frontend.pid
fi

if [ -f /tmp/nest-admin-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/nest-admin-backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    fi
    rm /tmp/nest-admin-backend.pid
fi

# 强制停止相关进程
pkill -f "vite" || true
pkill -f "nest start" || true

# 停止 PM2 服务（如果有）
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "nest_admin_server"; then
        pm2 stop nest_admin_server
        echo "✅ PM2 服务已停止"
    fi
fi

echo ""
echo "✅ 所有服务已停止"
