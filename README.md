# Nest Admin

一个基于 NestJS + Naive UI 的现代化后台管理系统。

## 📚 文档

- [快速开始](./docs/QUICK_START.md)
- [本地部署指南](./docs/LOCAL_DEPLOYMENT.md)
- [在线部署指南](./docs/DEPLOYMENT.md)
- [快速部署指南](./docs/QUICK_START_DEPLOY.md)
- [GitHub Actions 自动化部署](./docs/GITHUB_ACTIONS.md)
- **[GitHub Secrets 配置指南](./docs/GITHUB_SECRETS_SETUP.md)** ⭐ 解决部署配置问题

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
cd server && pnpm install
cd ../admin-naive-ui && pnpm install

# 启动后端
cd server && pnpm run start:dev

# 启动前端
cd admin-naive-ui && pnpm run dev
```

### 自动化部署

本项目支持通过 GitHub Actions 自动部署到服务器。

#### 遇到 "missing server host" 错误?

这是因为 GitHub Secrets 未配置。请按照以下步骤操作:

1. 📖 **阅读配置指南**: [GitHub Secrets 完整配置指南](./docs/GITHUB_SECRETS_SETUP.md)
2. ⚙️ **配置必需的 Secrets**:
   - `REMOTE_HOST` - 服务器 IP 或域名
   - `REMOTE_USER` - SSH 用户名
   - `SSH_PRIVATE_KEY` - SSH 私钥
   - `REMOTE_PORT` - SSH 端口 (可选,默认 22)
   - `REMOTE_FRONTEND_DIR` - 前端部署目录
   - `REMOTE_BACKEND_DIR` - 后端部署目录

3. 🚀 **触发部署**: 推送代码到 `main` 或 `main-soybean` 分支

详细步骤请参考 [GitHub Actions 部署指南](./docs/GITHUB_ACTIONS.md)

## 📦 项目结构

```
nest-admin/
├── admin-naive-ui/       # 前端项目 (Naive UI + Vue 3)
├── server/               # 后端项目 (NestJS)
├── docs/                 # 文档
├── scripts/              # 部署脚本
└── .github/              # GitHub Actions 工作流
```

## 🔧 技术栈

### 后端
- NestJS
- Prisma ORM
- PostgreSQL / MySQL
- JWT 认证

### 前端
- Vue 3
- Naive UI
- TypeScript
- Vite

## 📝 开发路线

查看 [ROADMAP.md](./docs/ROADMAP.md) 了解项目开发计划。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

[MIT License](./LICENSE)
