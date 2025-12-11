#!/bin/bash

# GitHub Secrets 配置检查脚本
# 此脚本帮助你验证 GitHub Secrets 配置是否正确

echo "🔍 GitHub Actions Secrets 配置检查"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_secret() {
    local secret_name=$1
    local description=$2
    local is_required=${3:-true}
    
    echo -n "检查 $secret_name ($description)... "
    
    if [ "$is_required" = true ]; then
        echo -e "${RED}[需要配置]${NC}"
        return 1
    else
        echo -e "${YELLOW}[可选]${NC}"
        return 0
    fi
}

echo "📋 必需的 Secrets:"
echo ""

errors=0

# 检查必需的 secrets
check_secret "REMOTE_HOST" "服务器 IP 或域名" true
((errors++))

check_secret "REMOTE_USER" "SSH 用户名" true
((errors++))

check_secret "SSH_PRIVATE_KEY" "SSH 私钥" true
((errors++))

check_secret "REMOTE_FRONTEND_DIR" "前端部署目录" true
((errors++))

check_secret "REMOTE_BACKEND_DIR" "后端部署目录" true
((errors++))

echo ""
echo "📋 可选的 Secrets:"
echo ""

check_secret "REMOTE_PORT" "SSH 端口 (默认: 22)" false

echo ""
echo "=================================="

if [ $errors -gt 0 ]; then
    echo -e "${RED}❌ 发现 $errors 个必需的 Secret 需要配置${NC}"
    echo ""
    echo "请按照以下步骤配置:"
    echo ""
    echo "1. 访问 GitHub 仓库设置页面:"
    echo "   https://github.com/你的用户名/Nest-Admin/settings/secrets/actions"
    echo ""
    echo "2. 点击 'New repository secret' 添加以下 Secrets:"
    echo ""
    echo "   📄 详细配置指南:"
    echo "   查看 docs/GITHUB_SECRETS_SETUP.md"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ 配置检查完成!${NC}"
    echo ""
    echo "提示: 此脚本只是提醒你需要在 GitHub 上配置 Secrets"
    echo "     实际配置需要在 GitHub 仓库设置中完成"
    echo ""
fi

# SSH 连接测试提示
echo "=================================="
echo "🔐 SSH 连接测试"
echo "=================================="
echo ""
echo "在配置 GitHub Secrets 之前,建议先测试 SSH 连接:"
echo ""

read -p "是否要测试 SSH 连接? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "请输入服务器地址 (IP 或域名): " server_host
    read -p "请输入 SSH 用户名: " ssh_user
    read -p "请输入 SSH 端口 (默认 22): " ssh_port
    ssh_port=${ssh_port:-22}
    read -p "请输入 SSH 私钥路径 (默认 ~/.ssh/id_rsa): " ssh_key
    ssh_key=${ssh_key:-~/.ssh/id_rsa}
    
    echo ""
    echo "测试 SSH 连接到 $ssh_user@$server_host:$ssh_port ..."
    echo ""
    
    if ssh -i "$ssh_key" -p "$ssh_port" -o ConnectTimeout=5 "$ssh_user@$server_host" "echo '✅ SSH 连接成功!'" 2>/dev/null; then
        echo ""
        echo -e "${GREEN}✅ SSH 连接测试成功!${NC}"
        echo ""
        echo "现在你可以将以下信息配置到 GitHub Secrets:"
        echo ""
        echo "REMOTE_HOST=$server_host"
        echo "REMOTE_USER=$ssh_user"
        echo "REMOTE_PORT=$ssh_port"
        echo "SSH_PRIVATE_KEY=<私钥内容>"
        echo ""
        echo "查看私钥内容:"
        echo "cat $ssh_key"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ SSH 连接失败!${NC}"
        echo ""
        echo "可能的原因:"
        echo "1. 服务器地址或端口错误"
        echo "2. SSH 私钥路径不正确"
        echo "3. 服务器未添加公钥到 authorized_keys"
        echo "4. 防火墙阻止了连接"
        echo ""
        echo "请检查配置后重试,或查看详细配置指南:"
        echo "docs/GITHUB_SECRETS_SETUP.md"
        echo ""
        exit 1
    fi
else
    echo ""
    echo "跳过 SSH 连接测试"
    echo ""
fi

echo "=================================="
echo "📚 更多帮助"
echo "=================================="
echo ""
echo "详细配置指南:"
echo "  docs/GITHUB_SECRETS_SETUP.md"
echo ""
echo "GitHub Actions 部署指南:"
echo "  docs/GITHUB_ACTIONS.md"
echo ""
echo "如需帮助,请访问:"
echo "  https://github.com/linlingqin77/Nest-Admin/issues"
echo ""
