#!/bin/bash

# 停止前端服务
# 使用方法: bash scripts/stop-frontend.sh

echo "🛑 停止前端服务..."

# 停止通过 PID 文件记录的进程
if [ -f /tmp/nest-admin-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/nest-admin-frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    else
        echo "⚠️  前端进程不存在 (PID: $FRONTEND_PID)"
    fi
    rm /tmp/nest-admin-frontend.pid
fi

# 强制停止 vite 进程
pkill -f "vite.*admin-naive-ui" || true

# 清理日志
if [ -f /tmp/nest-admin-frontend.log ]; then
    rm /tmp/nest-admin-frontend.log
    echo "🗑️  已清理日志文件"
fi

echo "✅ 前端服务已完全停止"
