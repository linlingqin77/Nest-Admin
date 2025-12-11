#!/bin/bash

# 前端部署脚本
# 使用方法: bash scripts/deploy-frontend.sh [environment]

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[前端]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[前端]${NC} $1"
}

log_error() {
    echo -e "${RED}[前端]${NC} $1"
}

# 显示横幅
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║          前端部署脚本                      ║"
echo "║      Frontend Deployment Script            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 获取环境
ENV=${1:-dev}

case $ENV in
    dev|development)
        NODE_ENV="development"
        BUILD_CMD="build:dev"
        RUN_CMD="dev"
        ;;
    test)
        NODE_ENV="test"
        BUILD_CMD="build:test"
        RUN_CMD="dev:test"
        ;;
    prod|production)
        NODE_ENV="production"
        BUILD_CMD="build"
        RUN_CMD="preview"
        ;;
    *)
        log_error "无效的环境: $ENV (可选: dev, test, prod)"
        exit 1
        ;;
esac

log_info "部署环境: $NODE_ENV"

# 检查依赖
log_info "检查依赖..."

if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    log_error "pnpm 未安装"
    exit 1
fi

log_success "依赖检查通过"

# 进入前端目录
cd admin-naive-ui

# 询问是否安装依赖
read -p "是否安装/更新依赖？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "安装依赖..."
    pnpm install
    log_success "依赖安装完成"
fi

# 根据环境执行不同操作
if [ "$NODE_ENV" = "production" ]; then
    # 生产环境：构建
    log_info "清理旧构建..."
    rm -rf dist
    
    log_info "开始构建..."
    pnpm run $BUILD_CMD
    
    if [ ! -d "dist" ]; then
        log_error "构建失败"
        exit 1
    fi
    
    log_success "构建完成"
    log_info "构建产物大小: $(du -sh dist | cut -f1)"
    
    echo ""
    log_success "═══════════════════════════════════════════"
    log_success "  前端构建完成！"
    log_success "═══════════════════════════════════════════"
    echo ""
    log_info "构建产物位置: $(pwd)/dist"
    echo ""
    log_info "预览构建结果: pnpm run preview"
    log_info "部署到服务器: 将 dist/ 目录复制到 Web 服务器"
    
else
    # 开发/测试环境：启动开发服务器
    log_info "停止现有进程..."
    pkill -f "vite.*admin-naive-ui" || true
    sleep 1
    
    log_info "启动开发服务器..."
    pnpm run $RUN_CMD &
    FRONTEND_PID=$!
    
    # 保存 PID
    echo $FRONTEND_PID > /tmp/nest-admin-frontend.pid
    
    echo ""
    log_success "═══════════════════════════════════════════"
    log_success "  前端服务已启动！"
    log_success "═══════════════════════════════════════════"
    echo ""
    log_info "环境: $NODE_ENV"
    log_info "地址: http://localhost:5173"
    log_info "PID: $FRONTEND_PID"
    log_info "日志: tail -f /tmp/nest-admin-frontend.log"
    echo ""
    log_info "停止服务: bash scripts/stop-frontend.sh"
    log_info "或按 Ctrl+C 停止"
    echo ""
    
    # 等待用户中断
    trap "log_info '停止前端服务...'; kill $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    wait
fi
