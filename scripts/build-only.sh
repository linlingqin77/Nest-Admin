#!/bin/bash

# 只构建脚本 - 不启动服务
# 使用方法: bash scripts/build-only.sh [environment]

set -e

ENV=${1:-prod}

case $ENV in
    dev|development)
        NODE_ENV="development"
        BUILD_CMD_FRONTEND="build:dev"
        ;;
    test)
        NODE_ENV="test"
        BUILD_CMD_FRONTEND="build:test"
        ;;
    prod|production)
        NODE_ENV="production"
        BUILD_CMD_FRONTEND="build"
        ;;
    *)
        echo "❌ 无效的环境: $ENV (可选: dev, test, prod)"
        exit 1
        ;;
esac

echo "🔨 构建 Nest Admin ($NODE_ENV)..."
echo ""

# 进入项目根目录
cd "$(dirname "$0")/.."

# 清理旧构建
echo "🧹 清理旧的构建产物..."
rm -rf admin-naive-ui/dist
rm -rf server/dist
echo "✅ 清理完成"
echo ""

# 构建前端
echo "🎨 构建前端..."
cd admin-naive-ui
pnpm run $BUILD_CMD_FRONTEND
cd ..
echo "✅ 前端构建完成"
echo ""

# 构建后端
echo "⚙️  构建后端..."
cd server
echo "   生成 Prisma Client..."
pnpm run prisma:generate
echo "   编译 TypeScript..."
pnpm run build
cd ..
echo "✅ 后端构建完成"
echo ""

# 显示构建信息
echo "📦 构建产物:"
echo "   前端: $(du -sh admin-naive-ui/dist | cut -f1)"
echo "   后端: $(du -sh server/dist | cut -f1)"
echo ""
echo "✅ 构建完成！"
echo ""
echo "🚀 启动服务:"
echo "   开发环境: bash scripts/quick-deploy.sh"
echo "   生产环境: bash scripts/deploy-local.sh prod"
