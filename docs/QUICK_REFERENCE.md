# 本地部署快速参考

## 🚀 一键启动（最快）

### 前后端一起启动
```bash
bash scripts/quick-deploy.sh
```

### 分开启动
```bash
# 只启动前端
bash scripts/start-frontend.sh

# 只启动后端
bash scripts/start-backend.sh
```

前端: http://localhost:5173  
后端: http://localhost:3000  
API: http://localhost:3000/api

## 🛑 停止服务

```bash
# 停止全部
bash scripts/stop-services.sh

# 只停止前端
bash scripts/stop-frontend.sh

# 只停止后端
bash scripts/stop-backend.sh
```

## 📦 完整部署

### 前后端一起部署
```bash
# 开发环境（启动开发服务器）
bash scripts/deploy-local.sh dev

# 测试环境
bash scripts/deploy-local.sh test

# 生产环境（构建+PM2）
bash scripts/deploy-local.sh prod
```

### 分开部署
```bash
# 只部署前端
bash scripts/deploy-frontend.sh [dev|test|prod]

# 只部署后端
bash scripts/deploy-backend.sh [dev|test|prod]
```

## 🔨 只构建

```bash
bash scripts/build-only.sh prod
```

## 📝 查看日志

```bash
# 快速部署的日志
tail -f /tmp/nest-admin-frontend.log
tail -f /tmp/nest-admin-backend.log

# PM2 日志
pm2 logs nest_admin_server
```

## 🔍 检查状态

```bash
# 查看进程
ps aux | grep -E "(vite|nest)" | grep -v grep

# 查看端口
lsof -i :3000  # 后端
lsof -i :5173  # 前端

# PM2 状态
pm2 list
```

## ⚙️ 手动启动

```bash
# 前端
cd admin-naive-ui && pnpm dev

# 后端
cd server && pnpm run start:dev
```

## 🐛 常见问题

### 端口被占用
```bash
# 停止所有服务
bash scripts/stop-services.sh

# 或手动杀死进程
kill -9 $(lsof -t -i:3000)
kill -9 $(lsof -t -i:5173)
```

### 重新安装依赖
```bash
# 前端
cd admin-naive-ui
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 后端
cd server
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 清理构建
```bash
rm -rf admin-naive-ui/dist
rm -rf server/dist
```

## 📚 详细文档

- [本地部署指南](./LOCAL_DEPLOYMENT.md)
- [GitHub Actions 部署](./GITHUB_ACTIONS.md)
- [部署配置总结](../.github/DEPLOYMENT_SETUP.md)

## Windows 用户

```cmd
REM 完整部署
scripts\deploy-local.bat dev

REM 配置检查
scripts\check-deploy-config.bat
```
