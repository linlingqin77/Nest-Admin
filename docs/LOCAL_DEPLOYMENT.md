# 本地部署脚本使用指南

## 📦 脚本列表

项目提供了多个本地部署脚本，适用于不同的部署场景：

### 完整部署脚本

| 脚本 | 用途 | 平台 |
|------|------|------|
| `deploy-local.sh` | 前后端一起部署 | Linux/Mac |
| `deploy-local.bat` | 前后端一起部署 | Windows |
| `quick-deploy.sh` | 快速启动开发环境 | Linux/Mac |

### 分开部署脚本 ⭐ 新增

| 脚本 | 用途 | 平台 |
|------|------|------|
| `deploy-frontend.sh` | 只部署前端 | Linux/Mac |
| `deploy-backend.sh` | 只部署后端 | Linux/Mac |
| `start-frontend.sh` | 快速启动前端 | Linux/Mac |
| `start-backend.sh` | 快速启动后端 | Linux/Mac |
| `stop-frontend.sh` | 停止前端服务 | Linux/Mac |
| `stop-backend.sh` | 停止后端服务 | Linux/Mac |

### 辅助脚本

| 脚本 | 用途 | 平台 |
|------|------|------|
| `build-only.sh` | 只构建不启动 | Linux/Mac |
| `stop-services.sh` | 停止所有服务 | Linux/Mac |

## 🚀 快速开始

### 方式一：前后端一起部署

**Linux/Mac:**
```bash
# 开发环境
bash scripts/deploy-local.sh dev

# 测试环境
bash scripts/deploy-local.sh test

# 生产环境
bash scripts/deploy-local.sh prod
```

**Windows:**
```cmd
scripts\deploy-local.bat dev
```

### 方式二：分开部署 ⭐ 推荐

适用于只需要启动前端或后端的场景。

**快速启动（开发环境）：**
```bash
# 只启动前端
bash scripts/start-frontend.sh

# 只启动后端
bash scripts/start-backend.sh

# 停止前端
bash scripts/stop-frontend.sh

# 停止后端
bash scripts/stop-backend.sh
```

**完整部署（支持多环境）：**
```bash
# 部署前端（开发环境）
bash scripts/deploy-frontend.sh dev

# 部署后端（生产环境，使用 PM2）
bash scripts/deploy-backend.sh prod
```

### 方式三：快速部署（同时启动前后端）

最快的方式，一键启动前后端开发服务器：

```bash
bash scripts/quick-deploy.sh
```

### 方式四：只构建

如果只想构建项目，不启动服务：

```bash
# 构建生产版本
bash scripts/build-only.sh prod

# 构建开发版本
bash scripts/build-only.sh dev

# 构建测试版本
bash scripts/build-only.sh test
```

## 📋 详细说明

### 1. deploy-local.sh / deploy-local.bat

**功能：**
- ✅ 检查依赖（Node.js, pnpm, PM2）
- ✅ 可选清理旧构建
- ✅ 可选安装/更新依赖
- ✅ 根据环境构建或启动开发服务器
- ✅ 生产环境支持 PM2 部署
- ✅ 详细的日志输出
- ✅ 优雅的服务停止（Ctrl+C）

**使用场景：**
- 完整的本地部署流程
- 首次部署项目
- 更新依赖后部署
- 生产环境部署

**参数：**
- `dev` / `development` - 开发环境
- `test` - 测试环境
- `prod` / `production` - 生产环境

**示例：**
```bash
# 开发环境（启动开发服务器）
bash scripts/deploy-local.sh dev

# 生产环境（构建并使用 PM2 启动）
bash scripts/deploy-local.sh prod
```

**交互式选项：**
1. 是否清理旧的构建产物？（生产环境）
2. 是否安装/更新依赖？

### 2. quick-deploy.sh

**功能：**
- ✅ 快速启动前后端开发服务器
- ✅ 自动停止现有进程
- ✅ 后台运行
- ✅ 记录 PID 和日志

**使用场景：**
- 日常开发
- 快速测试
- 不需要构建的场景

**特点：**
- 最快速度启动
- 服务在后台运行
- 日志输出到文件

**日志位置：**
- 前端：`/tmp/nest-admin-frontend.log`
- 后端：`/tmp/nest-admin-backend.log`

**停止服务：**
```bash
bash scripts/stop-services.sh
```

### 3. build-only.sh

**功能：**
- ✅ 只构建项目，不启动服务
- ✅ 清理旧构建产物
- ✅ 构建前端和后端
- ✅ 生成 Prisma Client
- ✅ 显示构建产物大小

**使用场景：**
- CI/CD 构建
- 准备部署包
- 验证构建是否成功

**示例：**
```bash
# 构建生产版本
bash scripts/build-only.sh prod

# 构建完成后手动启动
cd server
pnpm run start:prod
```

### 4. stop-services.sh

**功能：**
- ✅ 停止所有相关服务
- ✅ 清理 PID 文件
- ✅ 停止 PM2 服务（如果有）

**使用场景：**
- 停止通过 quick-deploy.sh 启动的服务
- 清理所有运行中的实例

## 🔧 环境说明

### 开发环境 (dev)

**前端：**
- 运行 `pnpm dev`
- 启动 Vite 开发服务器
- 热更新
- 端口：5173

**后端：**
- 运行 `pnpm run start:dev`
- NestJS watch 模式
- 自动重启
- 端口：3000

### 测试环境 (test)

**前端：**
- 运行 `pnpm run dev:test`
- 使用测试环境配置

**后端：**
- 运行 `pnpm run start:test`
- 使用测试环境配置

### 生产环境 (prod)

**前端：**
- 构建到 `admin-naive-ui/dist/`
- 优化和压缩

**后端：**
- 构建到 `server/dist/`
- 使用 PM2 启动（如果安装）
- 或使用 `node dist/main.js`

## 📊 服务访问

部署成功后，可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173 | 开发环境 |
| 前端 | http://localhost:4173 | 生产环境预览 |
| 后端 | http://localhost:3000 | API 服务 |
| API 文档 | http://localhost:3000/api | Swagger 文档 |

## 🛠️ 常用命令

### 查看服务状态

```bash
# PM2 管理的服务
pm2 list
pm2 logs nest_admin_server

# 进程状态
ps aux | grep nest
ps aux | grep vite

# 端口占用
lsof -i :3000  # 后端
lsof -i :5173  # 前端
```

### 停止服务

```bash
# 使用停止脚本
bash scripts/stop-services.sh

# 手动停止
pkill -f "nest start"
pkill -f "vite"

# 停止 PM2 服务
pm2 stop nest_admin_server
pm2 delete nest_admin_server
```

### 查看日志

```bash
# quick-deploy.sh 的日志
tail -f /tmp/nest-admin-frontend.log
tail -f /tmp/nest-admin-backend.log

# PM2 日志
pm2 logs nest_admin_server

# 实时日志
pm2 logs nest_admin_server --lines 100
```

## ⚙️ 配置要求

### 必需：
- Node.js >= 20.x
- pnpm >= 10.x

### 可选：
- PM2（生产环境推荐）

### 检查依赖：
```bash
node -v   # 查看 Node.js 版本
pnpm -v   # 查看 pnpm 版本
pm2 -v    # 查看 PM2 版本（可选）
```

### 安装依赖：
```bash
# 安装 pnpm
npm install -g pnpm

# 安装 PM2（可选）
npm install -g pm2
```

## 🐛 故障排查

### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 或使用停止脚本
bash scripts/stop-services.sh
```

### 2. 依赖安装失败

```bash
# 清理缓存重新安装
cd admin-naive-ui
rm -rf node_modules pnpm-lock.yaml
pnpm install

cd ../server
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 3. 构建失败

```bash
# 清理构建产物
rm -rf admin-naive-ui/dist
rm -rf server/dist

# 重新构建
bash scripts/build-only.sh prod
```

### 4. Prisma 相关错误

```bash
cd server

# 重新生成 Prisma Client
pnpm run prisma:generate

# 应用数据库迁移
pnpm run prisma:deploy

# 重置数据库（开发环境）
pnpm run prisma:reset
```

### 5. 权限问题（Linux/Mac）

```bash
# 添加执行权限
chmod +x scripts/*.sh
```

## 💡 最佳实践

### 日常开发

```bash
# 1. 快速启动
bash scripts/quick-deploy.sh

# 2. 开发完成后停止
bash scripts/stop-services.sh
```

### 首次部署

```bash
# 1. 完整部署（会提示安装依赖）
bash scripts/deploy-local.sh dev

# 2. 访问服务
open http://localhost:5173
```

### 生产部署

```bash
# 1. 构建
bash scripts/build-only.sh prod

# 2. 部署
bash scripts/deploy-local.sh prod

# 3. 验证
pm2 list
curl http://localhost:3000
```

### 更新依赖后

```bash
# 重新安装依赖并部署
bash scripts/deploy-local.sh dev
# 选择 y 安装依赖
```

## 🔄 工作流程示例

### 开发工作流

```bash
# 早上开始工作
bash scripts/quick-deploy.sh

# 查看日志（如需要）
tail -f /tmp/nest-admin-backend.log

# 晚上下班停止
bash scripts/stop-services.sh
```

### 测试工作流

```bash
# 构建测试版本
bash scripts/build-only.sh test

# 启动测试环境
bash scripts/deploy-local.sh test

# 运行测试...

# 停止服务
bash scripts/stop-services.sh
```

### 发布工作流

```bash
# 1. 构建生产版本
bash scripts/build-only.sh prod

# 2. 验证构建产物
ls -lh admin-naive-ui/dist
ls -lh server/dist

# 3. 本地测试
bash scripts/deploy-local.sh prod

# 4. 验证功能...

# 5. 提交到 Git
git add .
git commit -m "feat: ready for production"
git push

# 6. GitHub Actions 自动部署
```

## 📚 相关文档

- [GitHub Actions 部署指南](./GITHUB_ACTIONS.md)
- [部署配置总结](../.github/DEPLOYMENT_SETUP.md)
- [配置清单](../.github/DEPLOYMENT_CHECKLIST.md)

## ❓ 常见问题

**Q: 脚本权限不足怎么办？**
```bash
chmod +x scripts/*.sh
```

**Q: 如何只启动前端或后端？**
```bash
# 只启动前端
cd admin-naive-ui && pnpm dev

# 只启动后端
cd server && pnpm run start:dev
```

**Q: 如何切换环境？**
```bash
# 停止当前服务
bash scripts/stop-services.sh

# 启动新环境
bash scripts/deploy-local.sh test
```

**Q: 生产环境不使用 PM2 可以吗？**

可以，脚本会自动检测。如果没有 PM2，会使用 `node dist/main.js` 启动。

---

更多问题请查看 [完整部署指南](./GITHUB_ACTIONS.md)
