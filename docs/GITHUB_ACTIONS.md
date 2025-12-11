# GitHub Actions 自动化部署配置指南（使用 PM2）

> ⚠️ **遇到 "missing server host" 错误?** 请查看 [GitHub Secrets 配置详细指南](./GITHUB_SECRETS_SETUP.md)

## 📋 概述

本项目配置了两个 GitHub Actions 工作流用于自动化部署：

1. **deploy.yml** - 简单部署工作流
2. **deploy-advanced.yml** - 高级部署工作流（推荐使用）⭐

## 🚀 快速开始

### 第一步：配置 GitHub Secrets

> 📖 **详细配置指南**: 如果这是你第一次配置,强烈建议阅读 [GitHub Secrets 完整配置指南](./GITHUB_SECRETS_SETUP.md)

进入 GitHub 仓库 `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

添加以下必需的 Secrets：

| Secret Name | 说明 | 示例值 | 是否必需 |
|------------|------|--------|---------|
| `SSH_PRIVATE_KEY` | SSH 私钥完整内容 | `-----BEGIN RSA PRIVATE KEY-----...` | ✅ 必需 |
| `REMOTE_HOST` | 服务器 IP 地址 | `123.456.78.90` | ✅ 必需 |
| `REMOTE_USER` | SSH 用户名 | `root` 或 `www` | ✅ 必需 |
| `REMOTE_PORT` | SSH 端口 | `22` | 可选 (默认22) |
| `REMOTE_BACKEND_DIR` | 后端部署目录 | `/www/wwwroot/nest-admin-server` | ✅ 必需 |
| `REMOTE_FRONTEND_DIR` | 前端部署目录 | `/www/wwwroot/nest-admin-frontend` | ✅ 必需 |

### 第二步:生成 SSH 密钥对

在本地生成用于部署的 SSH 密钥：

```bash
# 生成 SSH 密钥对（无密码）
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github-actions -N ""

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github-actions.pub user@your-server-ip

# 查看私钥（复制此内容到 GitHub Secrets 的 SSH_PRIVATE_KEY）
cat ~/.ssh/github-actions
```

> 💡 **提示**: 完整的 SSH 密钥配置步骤请参考 [SSH 配置详解](./GITHUB_SECRETS_SETUP.md#ssh-私钥配置详解)

### 第三步：服务器环境准备

在服务器上执行以下命令：

```bash
# 1. 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 pnpm
npm install -g pnpm

# 3. 安装 PM2
npm install -g pm2

# 4. 创建部署目录
sudo mkdir -p /www/wwwroot/nest-admin-server
sudo mkdir -p /www/wwwroot/nest-admin-frontend
sudo mkdir -p /www/wwwlogs/pm2/nest_admin_server

# 5. 设置目录权限
sudo chown -R $USER:$USER /www/wwwroot
sudo chown -R $USER:$USER /www/wwwlogs

# 6. 配置环境变量文件
cd /www/wwwroot/nest-admin-server
nano .env.production
```

在 `.env.production` 中配置：

```env
NODE_ENV=production
PORT=3000

# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/nest_admin"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=2

# JWT
JWT_SECRET=your_production_secret_key_here

# 其他配置...
```

```bash
# 7. 设置 PM2 开机自启
pm2 startup
# 按照提示执行返回的命令
```

### 第四步：推送代码触发部署

```bash
git add .
git commit -m "chore: configure github actions deployment"
git push origin main-soybean
```

## 📚 工作流详解

### deploy.yml - 简单部署

适用于小型项目或简单部署需求。

**特点：**
- 直接传输文件
- 配置简单
- 适合快速部署

### deploy-advanced.yml - 高级部署 ⭐

推荐使用，提供更完善的部署流程。

**特点：**
- ✅ 自动备份当前版本
- ✅ 压缩传输（节省带宽）
- ✅ 健康检查
- ✅ 自动清理旧备份
- ✅ 详细日志输出
- ✅ 失败自动回滚

**工作流程：**

1. **构建阶段**
   - 检出代码
   - 安装依赖（使用缓存加速）
   - 构建前端 (`admin-naive-ui`)
   - 构建后端 (`server`)
   - 生成 Prisma Client
   - 压缩构建产物

2. **部署阶段**
   - 备份当前版本
   - 上传压缩包到服务器
   - 解压文件
   - 安装生产依赖
   - 运行数据库迁移（可选）
   - 使用 PM2 重启应用

3. **验证阶段**
   - 健康检查
   - 查看应用状态
   - 输出最新日志

## 🔧 PM2 配置说明

### ecosystem.config.cjs

项目已包含 PM2 配置文件 `server/ecosystem.config.cjs`：

```javascript
module.exports = {
  apps: [
    {
      name: 'nest_admin_server',
      namespace: 'nest_admin_server',
      max_memory_restart: '1024M',
      user: 'www',
      exec_mode: 'fork',
      cwd: '/www/wwwroot/nest-admin-server',
      script: 'dist/main.js',
      watch: false,
      out_file: '/www/wwwlogs/pm2/nest_admin_server/out.log',
      error_file: '/www/wwwlogs/pm2/nest_admin_server/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

**配置项说明：**

- `name`: 应用名称
- `cwd`: 工作目录（与 `REMOTE_BACKEND_DIR` 一致）
- `script`: 启动文件
- `max_memory_restart`: 内存超限自动重启
- `exec_mode`: 运行模式（fork 或 cluster）
- `watch`: 是否监听文件变化
- `env`: 环境变量

### 常用 PM2 命令

```bash
# 查看应用列表
pm2 list

# 查看实时日志
pm2 logs nest_admin_server

# 查看最近 100 行日志
pm2 logs nest_admin_server --lines 100

# 重启应用
pm2 restart nest_admin_server

# 重新加载（零停机）
pm2 reload nest_admin_server

# 停止应用
pm2 stop nest_admin_server

# 启动应用
pm2 start ecosystem.config.cjs --env production

# 删除应用
pm2 delete nest_admin_server

# 监控面板
pm2 monit

# 查看详细信息
pm2 show nest_admin_server

# 保存当前配置
pm2 save

# 清空日志
pm2 flush
```

## 🌐 Nginx 配置

### 前端配置示例

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /www/wwwroot/nest-admin-frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL 配置（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🐛 故障排查

### 1. GitHub Actions 失败

**检查清单：**
- ✅ 确认所有 Secrets 已正确配置
- ✅ SSH 私钥格式正确（包含完整的头尾）
- ✅ 服务器可以通过 SSH 连接
- ✅ 服务器有足够的磁盘空间

**常见错误：**

```bash
# SSH 连接失败
错误: Permission denied (publickey)
解决: 检查公钥是否正确添加到服务器 ~/.ssh/authorized_keys

# pnpm 锁文件配置不匹配
错误: ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
解决: 工作流已配置使用 --no-frozen-lockfile，会自动更新锁文件
      或在本地运行: pnpm install --no-frozen-lockfile 并提交

# 构建失败
错误: ENOENT: no such file or directory
解决: 检查路径配置是否正确

# PM2 启动失败
错误: Error: Cannot find module
解决: 确保依赖已正确安装
```

### 2. 应用启动失败

```bash
# 查看 PM2 日志
pm2 logs nest_admin_server --lines 200

# 查看错误日志
tail -n 100 /www/wwwlogs/pm2/nest_admin_server/err.log

# 手动测试启动
cd /www/wwwroot/nest-admin-server
node dist/main.js
```

### 3. 数据库连接问题

```bash
# 测试数据库连接
cd /www/wwwroot/nest-admin-server
npx prisma db pull

# 查看数据库状态
npx prisma migrate status

# 应用迁移
npx prisma migrate deploy
```

### 4. 端口已被占用

```bash
# 查看端口占用
sudo lsof -i :3000
# 或
sudo netstat -tlnp | grep 3000

# 杀死占用进程
sudo kill -9 <PID>
```

### 5. 权限问题

```bash
# 检查文件所有者
ls -la /www/wwwroot/nest-admin-server

# 修改所有者
sudo chown -R www:www /www/wwwroot/nest-admin-server

# 修改权限
sudo chmod -R 755 /www/wwwroot/nest-admin-server
```

## 🔄 回滚操作

如果新版本出现问题，可以快速回滚：

```bash
# 1. 查看备份列表
ls -la /www/wwwroot/nest-admin-server/ | grep backup

# 2. 回滚到指定版本
cd /www/wwwroot/nest-admin-server
rm -rf dist
mv dist.backup.20241211120000 dist

# 3. 重启应用
pm2 restart nest_admin_server

# 4. 验证
pm2 logs nest_admin_server
```

## 📊 监控和日志

### PM2 Plus（可选）

免费的应用监控服务：

```bash
# 注册并连接
pm2 link <secret> <public>

# 在 https://app.pm2.io 查看监控数据
```

### 日志管理

```bash
# 日志切割配置（使用 logrotate）
sudo nano /etc/logrotate.d/pm2

# 添加配置
/www/wwwlogs/pm2/*/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www www
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🚀 性能优化

### 1. 启用集群模式

修改 `ecosystem.config.cjs`：

```javascript
{
  exec_mode: 'cluster',
  instances: 'max', // 或指定数量
}
```

### 2. Nginx 缓存

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

# 在 location 块中使用
location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_pass http://localhost:3000/;
}
```

### 3. 启用 CDN

将静态资源上传到 CDN 服务（如阿里云 OSS、腾讯云 COS）

## 🔒 安全建议

1. **使用非 root 用户部署**
2. **配置防火墙**：只开放必要端口
3. **启用 HTTPS**：使用 Let's Encrypt 免费证书
4. **定期更新依赖**：`pnpm update`
5. **配置 fail2ban**：防止 SSH 暴力破解
6. **数据库定期备份**
7. **限制 API 访问频率**
8. **使用环境变量管理敏感信息**

## 📝 最佳实践

1. **版本标记**：使用 Git Tag 标记发布版本
2. **测试环境**：先部署到测试环境验证
3. **分支策略**：main 分支自动部署，dev 分支手动部署
4. **监控告警**：配置监控和告警通知
5. **文档维护**：及时更新部署文档
6. **回滚计划**：保留最近几个版本的备份

## 📖 相关文档

- [PM2 官方文档](https://pm2.keymetrics.io/docs/)
- [GitHub Actions 文档](https://docs.github.com/actions)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [Nginx 文档](https://nginx.org/en/docs/)

## ❓ 常见问题

**Q: 如何手动触发部署？**
A: 进入 GitHub Actions 页面，选择工作流，点击 "Run workflow"

**Q: 部署需要多长时间？**
A: 通常 3-5 分钟，取决于项目大小和网络速度

**Q: 如何查看部署日志？**
A: GitHub Actions 页面可以查看详细日志

**Q: 是否支持多环境部署？**
A: 支持，可以配置不同分支部署到不同环境

**Q: 如何暂停自动部署？**
A: 在 GitHub Actions 中禁用对应的工作流

## 🆘 获取帮助

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 查看服务器 PM2 日志
3. 检查配置文件
4. 查阅相关文档
5. 提交 Issue

   - 运行 ESLint
   - 运行单元测试
   
2. **Build**: 构建 Docker 镜像
   - 构建并推送到 GitHub Container Registry
   - 使用缓存优化构建速度
   
3. **Deploy**: 部署到服务器
   - SSH 连接服务器
   - 拉取最新代码
   - 安装依赖
   - 运行数据库迁移
   - 构建并重启服务

### 前端部署工作流 (deploy-frontend.yml)

**触发条件**：
- 推送到 `main` 或 `main-soybean` 分支
- 修改 `ruoyi-plus-soybean/**` 目录下的文件
- 手动触发

**工作流程**：
1. **Test**: 代码检查和构建测试
   - 运行 ESLint
   - 测试构建过程
   
2. **Build**: 构建 Docker 镜像
   - 构建并推送到 GitHub Container Registry
   
3. **Deploy**: 部署到服务器
   - SSH 连接服务器
   - 拉取最新代码
   - 构建项目
   - 部署到 Web 目录
   - 重启 Nginx

### Docker 部署工作流 (docker-deploy.yml)

**触发条件**：
- 推送到 `main` 或 `main-soybean` 分支
- 手动触发（可选择部署服务）

**工作流程**：
1. 连接服务器
2. 拉取最新代码
3. 使用 Docker Compose 构建并启动服务
4. 清理旧镜像
5. 健康检查

## 🔍 手动触发部署

### 通过 GitHub Web 界面

1. 进入仓库的 `Actions` 页面
2. 选择要运行的工作流
3. 点击 `Run workflow` 按钮
4. 选择分支和环境
5. 点击 `Run workflow` 确认

### 通过 GitHub CLI

```bash
# 安装 GitHub CLI
brew install gh

# 登录
gh auth login

# 触发后端部署
gh workflow run "Deploy Backend Server" \
  --ref main \
  -f environment=production

# 触发前端部署
gh workflow run "Deploy Frontend Web" \
  --ref main \
  -f environment=production

# 触发 Docker 部署
gh workflow run "Docker Build and Deploy" \
  --ref main \
  -f services=all
```

## 📊 监控工作流状态

### 查看工作流运行记录

```bash
# 列出最近的工作流运行
gh run list

# 查看特定运行的详情
gh run view <run-id>

# 查看运行日志
gh run view <run-id> --log

# 监控当前运行
gh run watch
```

### 工作流状态徽章

在 README.md 中添加状态徽章：

```markdown
![Backend Deploy](https://github.com/linlingqin77/Nest-Admin/actions/workflows/deploy-backend.yml/badge.svg)
![Frontend Deploy](https://github.com/linlingqin77/Nest-Admin/actions/workflows/deploy-frontend.yml/badge.svg)
```

## 🛡️ 安全最佳实践

### 1. SSH 密钥管理

- ✅ 为 CI/CD 创建专用的 SSH 密钥
- ✅ 不要在密钥上设置密码（CI/CD 需要）
- ✅ 定期轮换密钥
- ✅ 限制密钥的使用权限

### 2. Secrets 管理

- ✅ 不要在日志中打印敏感信息
- ✅ 使用环境特定的 Secrets
- ✅ 定期审查和更新 Secrets
- ✅ 使用 GitHub Environments 保护生产环境

### 3. 服务器安全

```bash
# 创建专用部署用户
sudo useradd -m -s /bin/bash deploy

# 设置目录权限
sudo chown -R deploy:deploy /www/wwwroot/nest-admin

# 配置 sudo 权限（如果需要）
echo "deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /usr/bin/systemctl restart nginx" | sudo tee /etc/sudoers.d/deploy
```

### 4. 工作流权限

在工作流文件中设置最小权限：

```yaml
permissions:
  contents: read
  packages: write
  actions: read
```

## 🐛 故障排除

### 问题 1: SSH 连接失败

```bash
# 测试 SSH 连接
ssh -i ~/.ssh/github_deploy_key -p 22 user@server "echo 'Connection OK'"

# 检查服务器 SSH 配置
sudo vim /etc/ssh/sshd_config
# 确保以下配置已启用：
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
```

### 问题 2: 权限不足

```bash
# 检查文件所有权
ls -la /www/wwwroot/nest-admin

# 修正权限
sudo chown -R deploy:deploy /www/wwwroot/nest-admin
chmod -R 755 /www/wwwroot/nest-admin
```

### 问题 3: 构建缓存问题

```yaml
# 在工作流中清除缓存
- name: Clear cache
  run: |
    rm -rf node_modules
    rm -rf .pnpm-store
```

### 问题 4: 环境变量未生效

```bash
# 在服务器上检查环境变量
cd /www/wwwroot/nest-admin/server
cat .env

# 重启 PM2 并更新环境变量
pm2 reload ecosystem.config.cjs --update-env
```

## 📈 性能优化

### 1. 使用缓存加速构建

工作流已配置 pnpm 缓存和 Docker 缓存：

```yaml
# pnpm 缓存
- uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}

# Docker 缓存
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 2. 并行执行任务

```yaml
jobs:
  test-backend:
    runs-on: ubuntu-latest
  
  test-frontend:
    runs-on: ubuntu-latest
  
  deploy:
    needs: [test-backend, test-frontend]
```

### 3. 条件执行

```yaml
# 仅在特定文件变更时执行
on:
  push:
    paths:
      - 'server/**'
      - '.github/workflows/deploy-backend.yml'
```

## 📝 自定义工作流

### 添加通知功能

```yaml
- name: Send notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 添加代码质量检查

```yaml
- name: Run SonarQube scan
  uses: sonarsource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 添加性能测试

```yaml
- name: Run performance tests
  run: |
    pnpm install -g lighthouse
    lighthouse ${{ secrets.WEB_URL }} --output json --output-path ./lighthouse.json
```

---

**参考资源**：
- [GitHub Actions 文档](https://docs.github.com/actions)
- [SSH Action 文档](https://github.com/appleboy/ssh-action)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
