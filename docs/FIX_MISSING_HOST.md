# 快速修复: GitHub Actions "missing server host" 错误

## 问题描述

GitHub Actions 执行失败,显示错误:
```
Error: missing server host
```

## 原因

`appleboy/ssh-action` 需要服务器主机地址,但 GitHub Secrets 中的 `REMOTE_HOST` 未配置或为空。

## 快速解决方案

### 方案 1: 配置 GitHub Secrets (推荐)

1. **打开 GitHub 仓库设置**
   ```
   https://github.com/你的用户名/Nest-Admin/settings/secrets/actions
   ```

2. **点击 "New repository secret" 添加以下 Secrets:**

   | Secret 名称 | 说明 | 示例 |
   |------------|------|------|
   | `REMOTE_HOST` | 服务器 IP 或域名 | `192.168.1.100` |
   | `REMOTE_USER` | SSH 用户名 | `root` |
   | `SSH_PRIVATE_KEY` | SSH 私钥完整内容 | `-----BEGIN...` |
   | `REMOTE_PORT` | SSH 端口 | `22` |
   | `REMOTE_FRONTEND_DIR` | 前端部署目录 | `/var/www/frontend` |
   | `REMOTE_BACKEND_DIR` | 后端部署目录 | `/opt/backend` |

3. **重新运行 GitHub Actions**

### 方案 2: 使用本地部署脚本

如果暂时不想配置 GitHub Actions,可以使用本地部署:

```bash
# 使用快速部署脚本
./scripts/quick-deploy.sh

# 或分别部署前后端
./scripts/deploy-frontend.sh
./scripts/deploy-backend.sh
```

## 配置 SSH 密钥

### 1. 生成密钥对

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_deploy
```

### 2. 添加公钥到服务器

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server
```

### 3. 复制私钥到 GitHub Secrets

```bash
cat ~/.ssh/github_actions_deploy
```

复制输出的完整内容(包括 BEGIN 和 END 行),粘贴到 GitHub Secrets 的 `SSH_PRIVATE_KEY`。

## 验证配置

### 测试 SSH 连接

```bash
# 运行配置检查脚本
./scripts/check-github-secrets.sh

# 或手动测试
ssh -i ~/.ssh/github_actions_deploy user@your-server "echo 'Connection OK'"
```

### 检查工作流

已更新的工作流会在运行前检查必需的 Secrets,并提供清晰的错误信息:

```yaml
- name: Check required secrets
  run: |
    if [ -z "${{ secrets.REMOTE_HOST }}" ]; then
      echo "❌ Error: REMOTE_HOST secret is not set"
      echo "Please configure required secrets..."
      exit 1
    fi
```

## 常见问题

### Q1: 如何找到 GitHub Secrets 设置页面?

**A:** 
1. 打开你的 GitHub 仓库
2. 点击顶部的 `Settings` 标签
3. 左侧菜单找到 `Secrets and variables`
4. 点击 `Actions`
5. 点击 `New repository secret`

### Q2: SSH_PRIVATE_KEY 应该包含什么内容?

**A:** 包含完整的私钥文件内容,格式如下:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
... (更多行) ...
-----END OPENSSH PRIVATE KEY-----
```

### Q3: 端口是必需的吗?

**A:** `REMOTE_PORT` 是可选的,默认值为 22。如果你的服务器使用标准 SSH 端口,可以不配置。

### Q4: 如何测试配置是否正确?

**A:** 
1. 提交一个小改动触发 GitHub Actions
2. 查看 Actions 标签页的运行日志
3. 新的检查步骤会提前验证配置

## 详细文档

- **完整配置指南**: [docs/GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)
- **GitHub Actions 文档**: [docs/GITHUB_ACTIONS.md](./GITHUB_ACTIONS.md)
- **本地部署指南**: [docs/LOCAL_DEPLOYMENT.md](./LOCAL_DEPLOYMENT.md)

## 获取帮助

如果以上方案都无法解决问题:

1. 查看 [完整配置指南](./GITHUB_SECRETS_SETUP.md)
2. 检查 GitHub Actions 运行日志
3. 提交 Issue: https://github.com/linlingqin77/Nest-Admin/issues

## 更新日志

- ✅ 添加了 Secrets 配置检查步骤
- ✅ 为所有端口配置添加了默认值 (22)
- ✅ 提供了详细的错误提示信息
- ✅ 创建了配置验证脚本
