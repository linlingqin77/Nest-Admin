# GitHub Secrets 配置指南

## 问题说明

如果你在 GitHub Actions 中看到 `Error: missing server host` 错误,说明你需要配置 GitHub Secrets。

## 必需的 Secrets

在 GitHub 仓库中配置以下 Secrets:

### 1. 访问仓库设置

1. 打开你的 GitHub 仓库页面
2. 点击 `Settings` (设置)
3. 在左侧菜单中找到 `Secrets and variables` → `Actions`
4. 点击 `New repository secret` 添加以下秘钥

### 2. 配置必需的 Secrets

#### SSH 连接配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `REMOTE_HOST` | **必需** 服务器 IP 地址或域名 | `192.168.1.100` 或 `example.com` |
| `REMOTE_USER` | **必需** SSH 登录用户名 | `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | **必需** SSH 私钥内容 | 见下方说明 |
| `REMOTE_PORT` | SSH 端口号 (可选,默认 22) | `22` |

#### 部署目录配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `REMOTE_FRONTEND_DIR` | **必需** 前端部署目录 | `/var/www/nest-admin-frontend` |
| `REMOTE_BACKEND_DIR` | **必需** 后端部署目录 | `/opt/nest-admin-server` |

## SSH 私钥配置详解

### 生成 SSH 密钥对

如果你还没有 SSH 密钥对,在本地终端运行:

```bash
# 生成新的 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# 这会生成两个文件:
# ~/.ssh/github_actions_deploy      (私钥 - 用于 GitHub Secret)
# ~/.ssh/github_actions_deploy.pub  (公钥 - 用于服务器)
```

### 配置服务器

将公钥添加到服务器:

```bash
# 方法1: 使用 ssh-copy-id (推荐)
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server

# 方法2: 手动添加
# 在服务器上执行:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
# 粘贴 github_actions_deploy.pub 的内容
EOF
chmod 600 ~/.ssh/authorized_keys
```

### 添加私钥到 GitHub Secrets

1. 在本地查看私钥内容:

```bash
cat ~/.ssh/github_actions_deploy
```

2. 复制完整的私钥内容(包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`)

3. 在 GitHub 仓库中创建名为 `SSH_PRIVATE_KEY` 的 Secret,粘贴私钥内容

## 快速配置步骤

### 步骤 1: 准备服务器信息

```bash
# 记录以下信息:
服务器地址: _________________
SSH 用户名: _________________
SSH 端口:   _________________ (默认 22)
前端目录:   _________________
后端目录:   _________________
```

### 步骤 2: 配置 SSH 密钥

```bash
# 在本地生成密钥
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions

# 将公钥复制到服务器
ssh-copy-id -i ~/.ssh/github_actions.pub your-user@your-server

# 测试连接
ssh -i ~/.ssh/github_actions your-user@your-server
```

### 步骤 3: 添加到 GitHub Secrets

访问: `https://github.com/你的用户名/Nest-Admin/settings/secrets/actions`

添加以下 Secrets:

```yaml
REMOTE_HOST: 你的服务器IP或域名
REMOTE_USER: SSH用户名
REMOTE_PORT: 22
SSH_PRIVATE_KEY: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  (粘贴私钥内容)
  -----END OPENSSH PRIVATE KEY-----
REMOTE_FRONTEND_DIR: /var/www/nest-admin-frontend
REMOTE_BACKEND_DIR: /opt/nest-admin-server
```

## 服务器准备

确保服务器已安装以下软件:

```bash
# Node.js (v18 或更高版本)
node --version

# pnpm
npm install -g pnpm

# PM2
npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
```

## 目录权限

确保部署目录有正确的权限:

```bash
# 创建目录
sudo mkdir -p /var/www/nest-admin-frontend
sudo mkdir -p /opt/nest-admin-server

# 设置所有者 (替换 your-user 为你的用户名)
sudo chown -R your-user:your-user /var/www/nest-admin-frontend
sudo chown -R your-user:your-user /opt/nest-admin-server

# 设置权限
chmod 755 /var/www/nest-admin-frontend
chmod 755 /opt/nest-admin-server
```

## 验证配置

### 本地测试 SSH 连接

```bash
# 使用你配置的私钥测试连接
ssh -i ~/.ssh/github_actions_deploy -p 22 your-user@your-server "echo 'Connection successful!'"
```

### 测试 GitHub Actions

1. 提交一个小改动到仓库
2. 查看 Actions 标签页
3. 检查工作流执行状态
4. 如果出现错误,检查日志中的详细信息

## 常见问题

### 1. "Permission denied (publickey)" 错误

**原因**: 服务器未正确配置公钥

**解决**:
```bash
# 在服务器上检查
cat ~/.ssh/authorized_keys
# 确保包含你的公钥

# 检查权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 2. "Host key verification failed" 错误

**解决**: 在 ssh-action 中添加:
```yaml
script_stop: true
```

或在服务器首次连接时:
```bash
ssh-keyscan -H your-server >> ~/.ssh/known_hosts
```

### 3. 端口连接超时

**原因**: 防火墙或安全组阻止了 SSH 端口

**解决**:
```bash
# 检查防火墙
sudo ufw status
sudo ufw allow 22/tcp

# 或者检查云服务器的安全组设置
```

### 4. "missing server host" 错误

**原因**: GitHub Secrets 未配置或名称错误

**解决**: 
- 检查 Secret 名称是否完全匹配(大小写敏感)
- 确认所有必需的 Secrets 都已添加
- 工作流添加了检查步骤会提前提示

## 安全建议

1. **使用独立的部署密钥**: 不要使用个人 SSH 密钥
2. **最小权限原则**: 部署用户只需要必要的权限
3. **定期轮换密钥**: 建议每 6-12 个月更换一次
4. **限制 IP**: 如果可能,在服务器上限制允许连接的 IP
5. **使用专用端口**: 考虑将 SSH 端口改为非标准端口

## 额外配置(可选)

### 配置环境变量

如果需要在部署时使用环境变量:

```yaml
REMOTE_ENV_FILE: |
  NODE_ENV=production
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
```

### 配置通知

在工作流末尾添加通知步骤,部署成功或失败时接收通知。

## 参考文档

- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH 密钥生成](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
