#!/bin/bash

# Nest Admin 本地部署脚本
# 使用方法: bash scripts/deploy-local.sh [environment]
# 环境选项: dev (开发环境), test (测试环境), prod (生产环境)

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║     Nest Admin 本地部署脚本                ║"
    echo "║     Local Deployment Script                ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 20.x"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        log_error "Node.js 版本过低 (当前: $(node -v))，需要 >= 20.x"
        exit 1
    fi
    log_success "Node.js 版本: $(node -v)"
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装，请运行: npm install -g pnpm"
        exit 1
    fi
    log_success "pnpm 版本: $(pnpm -v)"
    
    # 检查 PM2
    if ! command -v pm2 &> /dev/null; then
        log_warning "PM2 未安装，将跳过 PM2 部署"
        USE_PM2=false
    else
        log_success "PM2 版本: $(pm2 -v)"
        USE_PM2=true
    fi
}

# 获取环境变量
get_environment() {
    ENV=${1:-dev}
    
    case $ENV in
        dev|development)
            NODE_ENV="development"
            ;;
        test)
            NODE_ENV="test"
            ;;
        prod|production)
            NODE_ENV="production"
            ;;
        *)
            log_error "无效的环境: $ENV (可选: dev, test, prod)"
            exit 1
            ;;
    esac
    
    log_info "部署环境: $NODE_ENV"
}

# 清理旧的构建产物
clean_build() {
    log_info "清理旧的构建产物..."
    
    # 清理前端
    if [ -d "admin-naive-ui/dist" ]; then
        rm -rf admin-naive-ui/dist
        log_success "已清理前端构建产物"
    fi
    
    # 清理后端
    if [ -d "server/dist" ]; then
        rm -rf server/dist
        log_success "已清理后端构建产物"
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装前端依赖
    log_info "安装前端依赖..."
    cd admin-naive-ui
    pnpm install
    cd ..
    log_success "前端依赖安装完成"
    
    # 安装后端依赖
    log_info "安装后端依赖..."
    cd server
    pnpm install
    cd ..
    log_success "后端依赖安装完成"
}

# 构建前端
build_frontend() {
    log_info "开始构建前端..."
    
    cd admin-naive-ui
    
    case $NODE_ENV in
        development)
            pnpm run build:dev
            ;;
        test)
            pnpm run build:test
            ;;
        production)
            pnpm run build
            ;;
    esac
    
    cd ..
    
    if [ ! -d "admin-naive-ui/dist" ]; then
        log_error "前端构建失败"
        exit 1
    fi
    
    log_success "前端构建完成"
}

# 构建后端
build_backend() {
    log_info "开始构建后端..."
    
    cd server
    
    # 生成 Prisma Client
    log_info "生成 Prisma Client..."
    pnpm run prisma:generate
    
    # 构建
    pnpm run build
    
    cd ..
    
    if [ ! -d "server/dist" ]; then
        log_error "后端构建失败"
        exit 1
    fi
    
    log_success "后端构建完成"
}

# 启动前端开发服务器
start_frontend_dev() {
    log_info "启动前端开发服务器..."
    
    cd admin-naive-ui
    
    case $NODE_ENV in
        development)
            pnpm dev &
            ;;
        test)
            pnpm run dev:test &
            ;;
        production)
            pnpm run dev:prod &
            ;;
    esac
    
    FRONTEND_PID=$!
    cd ..
    
    log_success "前端开发服务器已启动 (PID: $FRONTEND_PID)"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    cd server
    
    if [ "$USE_PM2" = true ] && [ "$NODE_ENV" = "production" ]; then
        # 使用 PM2 启动（生产环境）
        log_info "使用 PM2 启动后端..."
        
        if pm2 list | grep -q "nest_admin_server"; then
            pm2 reload ecosystem.config.cjs --env production
            log_success "后端服务已重启 (PM2)"
        else
            pm2 start ecosystem.config.cjs --env production
            log_success "后端服务已启动 (PM2)"
        fi
        
        pm2 save
        pm2 logs nest_admin_server --lines 20
    else
        # 开发/测试环境：直接启动
        case $NODE_ENV in
            development)
                pnpm run start:dev &
                ;;
            test)
                pnpm run start:test &
                ;;
            production)
                pnpm run start:prod &
                ;;
        esac
        
        BACKEND_PID=$!
        log_success "后端服务已启动 (PID: $BACKEND_PID)"
    fi
    
    cd ..
}

# 显示部署信息
show_deployment_info() {
    echo ""
    log_success "═══════════════════════════════════════════"
    log_success "  部署完成！"
    log_success "═══════════════════════════════════════════"
    echo ""
    log_info "环境: $NODE_ENV"
    echo ""
    
    if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "test" ]; then
        log_info "前端地址: http://localhost:5173"
        log_info "后端地址: http://localhost:3000"
        log_info "API 文档: http://localhost:3000/api"
        echo ""
        log_info "前端 PID: ${FRONTEND_PID:-N/A}"
        log_info "后端 PID: ${BACKEND_PID:-N/A}"
        echo ""
        log_warning "按 Ctrl+C 停止服务"
    else
        log_info "后端服务已使用 PM2 启动"
        echo ""
        log_info "查看服务状态: pm2 list"
        log_info "查看日志: pm2 logs nest_admin_server"
        log_info "重启服务: pm2 restart nest_admin_server"
        log_info "停止服务: pm2 stop nest_admin_server"
    fi
    
    echo ""
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    sleep 3
    
    # 检查后端是否启动
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "后端服务运行正常"
    else
        log_warning "后端服务可能需要更多时间启动"
    fi
}

# 清理函数（Ctrl+C 时调用）
cleanup() {
    echo ""
    log_warning "正在停止服务..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log_info "前端服务已停止"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        log_info "后端服务已停止"
    fi
    
    exit 0
}

# 主函数
main() {
    show_banner
    
    # 获取环境
    get_environment "$1"
    
    # 检查依赖
    check_dependencies
    
    # 询问是否清理旧构建
    if [ "$NODE_ENV" = "production" ]; then
        read -p "是否清理旧的构建产物？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            clean_build
        fi
    fi
    
    # 询问是否安装依赖
    read -p "是否安装/更新依赖？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_dependencies
    fi
    
    if [ "$NODE_ENV" = "production" ]; then
        # 生产环境：构建并使用 PM2 启动
        build_frontend
        build_backend
        start_backend
    else
        # 开发/测试环境：启动开发服务器
        start_frontend_dev
        start_backend
        
        # 设置清理函数
        trap cleanup SIGINT SIGTERM
    fi
    
    # 等待服务启动
    wait_for_services
    
    # 显示部署信息
    show_deployment_info
    
    # 开发环境保持运行
    if [ "$NODE_ENV" != "production" ]; then
        wait
    fi
}

# 运行主函数
main "$@"
