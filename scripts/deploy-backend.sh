#!/bin/bash

# 后端部署脚本
# 使用方法: bash scripts/deploy-backend.sh [environment]

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[后端]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[后端]${NC} $1"
}

log_error() {
    echo -e "${RED}[后端]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[后端]${NC} $1"
}

# 显示横幅
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║          后端部署脚本                      ║"
echo "║       Backend Deployment Script            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 获取环境
ENV=${1:-dev}

case $ENV in
    dev|development)
        NODE_ENV="development"
        RUN_CMD="start:dev"
        ;;
    test)
        NODE_ENV="test"
        RUN_CMD="start:test"
        ;;
    prod|production)
        NODE_ENV="production"
        RUN_CMD="start:prod"
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

USE_PM2=false
if command -v pm2 &> /dev/null; then
    USE_PM2=true
    log_success "PM2 已安装"
else
    log_warning "PM2 未安装，将使用普通方式启动"
fi

log_success "依赖检查通过"

# 进入后端目录
cd server

# 询问是否安装依赖
read -p "是否安装/更新依赖？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "安装依赖..."
    pnpm install
    log_success "依赖安装完成"
fi

# 生成 Prisma Client
log_info "生成 Prisma Client..."
pnpm run prisma:generate

# 根据环境执行不同操作
if [ "$NODE_ENV" = "production" ]; then
    # 生产环境：构建并启动
    log_info "清理旧构建..."
    rm -rf dist
    
    log_info "开始构建..."
    pnpm run build
    
    if [ ! -d "dist" ]; then
        log_error "构建失败"
        exit 1
    fi
    
    log_success "构建完成"
    log_info "构建产物大小: $(du -sh dist | cut -f1)"
    
    # 启动服务
    log_info "启动生产服务..."
    
    if [ "$USE_PM2" = true ]; then
        # 使用 PM2
        log_info "使用 PM2 启动..."
        
        if pm2 list | grep -q "nest_admin_server"; then
            pm2 reload ecosystem.config.cjs --env production
            log_success "后端服务已重启 (PM2)"
        else
            pm2 start ecosystem.config.cjs --env production
            log_success "后端服务已启动 (PM2)"
        fi
        
        pm2 save
        
        echo ""
        log_success "═══════════════════════════════════════════"
        log_success "  后端服务已启动（PM2）！"
        log_success "═══════════════════════════════════════════"
        echo ""
        log_info "环境: $NODE_ENV"
        log_info "地址: http://localhost:3000"
        log_info "API: http://localhost:3000/api"
        echo ""
        log_info "查看状态: pm2 list"
        log_info "查看日志: pm2 logs nest_admin_server"
        log_info "重启服务: pm2 restart nest_admin_server"
        log_info "停止服务: pm2 stop nest_admin_server"
        echo ""
        
        # 显示最近日志
        log_info "最近日志:"
        pm2 logs nest_admin_server --lines 20 --nostream
        
    else
        # 普通方式启动
        log_info "使用普通方式启动..."
        pnpm run $RUN_CMD &
        BACKEND_PID=$!
        echo $BACKEND_PID > /tmp/nest-admin-backend.pid
        
        echo ""
        log_success "═══════════════════════════════════════════"
        log_success "  后端服务已启动！"
        log_success "═══════════════════════════════════════════"
        echo ""
        log_info "环境: $NODE_ENV"
        log_info "地址: http://localhost:3000"
        log_info "API: http://localhost:3000/api"
        log_info "PID: $BACKEND_PID"
        echo ""
        log_info "停止服务: bash scripts/stop-backend.sh"
        log_info "或按 Ctrl+C 停止"
        echo ""
        
        trap "log_info '停止后端服务...'; kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
        wait
    fi
    
else
    # 开发/测试环境：启动开发服务器
    log_info "停止现有进程..."
    pkill -f "nest start.*server" || true
    sleep 1
    
    log_info "启动开发服务器..."
    pnpm run $RUN_CMD > /tmp/nest-admin-backend.log 2>&1 &
    BACKEND_PID=$!
    
    # 保存 PID
    echo $BACKEND_PID > /tmp/nest-admin-backend.pid
    
    echo ""
    log_success "═══════════════════════════════════════════"
    log_success "  后端服务已启动！"
    log_success "═══════════════════════════════════════════"
    echo ""
    log_info "环境: $NODE_ENV"
    log_info "地址: http://localhost:3000"
    log_info "API: http://localhost:3000/api"
    log_info "PID: $BACKEND_PID"
    log_info "日志: tail -f /tmp/nest-admin-backend.log"
    echo ""
    log_info "停止服务: bash scripts/stop-backend.sh"
    log_info "或按 Ctrl+C 停止"
    echo ""
    
    # 等待用户中断
    trap "log_info '停止后端服务...'; kill $BACKEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
    wait
fi
