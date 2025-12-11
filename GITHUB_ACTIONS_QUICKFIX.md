# GitHub Actions "missing server host" 错误 - 快速修复

## 🚨 遇到这个错误?

```
Error: missing server host
```

## ✅ 快速解决(3 步)

### 1️⃣ 打开 GitHub Secrets 设置

访问: `https://github.com/你的用户名/Nest-Admin/settings/secrets/actions`

### 2️⃣ 添加必需的 Secrets

点击 "New repository secret",添加以下 6 个配置:



### 3️⃣ 获取 SSH 私钥

```bash
# 生成新密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy

# 添加公钥到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-server

# 查看私钥(复制全部内容到 SSH_PRIVATE_KEY)
cat ~/.ssh/github_deploy
```

## 📚 详细文档

- **完整配置指南**: [docs/GITHUB_SECRETS_SETUP.md](docs/GITHUB_SECRETS_SETUP.md)
- **快速修复指南**: [docs/FIX_MISSING_HOST.md](docs/FIX_MISSING_HOST.md)

## 🔧 使用配置检查脚本

```bash
./scripts/check-github-secrets.sh
```

## ❓ 还有问题?

查看 [修复报告](docs/GITHUB_ACTIONS_FIX_REPORT.md) 或提交 Issue。
