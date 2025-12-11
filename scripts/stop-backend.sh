#!/bin/bash

# 停止后端服务
# 使用方法: bash scripts/stop-backend.sh

echo "🛑 停止后端服务..."

# 停止通过 PID 文件记录的进程
if [ -f /tmp/nest-admin-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/nest-admin-backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    else
        echo "⚠️  后端进程不存在 (PID: $BACKEND_PID)"
    fi
    rm /tmp/nest-admin-backend.pid
fi

# 强制停止 nest 进程
pkill -f "nest start.*server" || true

# 停止 PM2 服务（如果有）
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "nest_admin_server"; then
        pm2 stop nest_admin_server
        echo "✅ PM2 服务已停止"
    fi
fi

# 清理日志
if [ -f /tmp/nest-admin-backend.log ]; then
    rm /tmp/nest-admin-backend.log
    echo "🗑️  已清理日志文件"
fi

echo "✅ 后端服务已完全停止"
