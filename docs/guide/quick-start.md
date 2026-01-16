# 快速开始

本指南将帮助你在 5 分钟内启动 Nest-Admin-Soybean 项目。

## 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: >= 20.19.0
- **pnpm**: >= 10.5.0
- **PostgreSQL**: >= 14
- **Redis**: >= 7

::: tip 提示
推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本，使用 [Homebrew](https://brew.sh/) (macOS) 或 [Docker](https://www.docker.com/) 安装数据库服务。

验证环境版本：
```bash
node -v    # 应显示 v20.19.0 或更高
pnpm -v    # 应显示 10.5.0 或更高
```
:::

## 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/linlingqin77/Nest-Admin-Soybean.git

# 或使用 SSH
git clone git@github.com:linlingqin77/Nest-Admin-Soybean.git

# 进入项目目录
cd Nest-Admin-Soybean
```

## 安装依赖

项目使用 pnpm 作为包管理器，支持 workspace 多包管理。

```bash
# 安装 pnpm (如果还未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

::: warning 注意
首次安装可能需要较长时间，请耐心等待。如果遇到网络问题，可以配置淘宝镜像：

```bash
pnpm config set registry https://registry.npmmirror.com
```
:::

## 配置数据库

### 1. 创建数据库

首先在 PostgreSQL 中创建数据库：

```sql
CREATE DATABASE "nest-admin-soybean";
```

### 2. 配置环境变量

后端项目使用 `server/src/config/index.ts` 作为配置中心，开发环境配置在 `.env.development`：

```bash
cd server

# 复制环境变量模板（如果有）
cp .env.example .env.development
```

编辑 `.env.development`，配置数据库连接：

```ini
# 开发环境
NODE_ENV=development

# 数据库配置通过 config/index.ts 读取，不需要 DATABASE_URL
# 直接修改 config/index.ts 中的数据库配置即可
```

::: tip 配置说明
项目使用 `config/index.ts` 作为统一配置入口，而不是直接读取 `.env` 文件。数据库连接配置位于 `config/index.ts` 的 `db.postgresql` 部分。
:::

### 3. 生成 Prisma 客户端

```bash
# 生成 Prisma 客户端
pnpm prisma:generate
```

### 4. 运行数据库迁移

```bash
# 创建数据库表结构
pnpm prisma:migrate
```

### 5. 初始化数据

```bash
# 初始化演示数据（包含管理员账户和演示账户）
pnpm prisma:seed
```

::: tip 初始账户
数据初始化完成后，将创建以下账户：

**管理员账户**：
- 账号：`admin`
- 密码：`admin123`
- 租户ID：`000000`

**演示账户**：
- 账号：`demo`
- 密码：`demo123`
- 租户ID：`000000`

**测试账户**：
- 账号：`test`
- 密码：`test123`
- 租户ID：`000000`

详细账户说明请查看 [测试账户文档](/TEST_ACCOUNTS)
:::

## 生成加密密钥

项目使用 RSA 加密保护敏感数据传输，需要生成密钥对：

```bash
# 在 server 目录下执行
pnpm generate:keys
```

该命令会在 `server/keys/` 目录下生成：
- `private.pem` - 私钥
- `public.pem` - 公钥

## 启动后端服务

```bash
# 在 server 目录下
pnpm start:dev
```

后端服务将在 `http://localhost:8080` 启动，你应该看到类似输出：

```
[Nest] 12345  - 2024/12/22 10:00:00     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 12345  - 2024/12/22 10:00:00     LOG [Bootstrap] 
🚀 Application is running on: http://localhost:8080
📚 API Documentation: http://localhost:8080/api-docs
🏥 Health Check: http://localhost:8080/api/health
```

::: tip 提示
开发模式下支持热重载，修改代码后会自动重启服务。
:::

## 启动前端服务

打开新的终端窗口：

```bash
# 进入前端目录
cd admin-naive-ui

# 启动开发服务器
pnpm dev
```

前端服务将在 `http://localhost:9527` 启动：

```
VITE v7.0.0  ready in 1234 ms

➜  Local:   http://localhost:9527/
➜  Network: use --host to expose
```

## 访问系统

在浏览器中打开 `http://localhost:9527`，使用以下账户登录：

### 管理员登录

- **账号**: `admin`
- **密码**: `admin123`
- **租户ID**: `000000`

### 演示账户登录

- **账号**: `demo`
- **密码**: `demo123`
- **租户ID**: `000000`

::: tip 演示账户
演示账户具有 27 个只读权限，可以查看所有模块但不能进行修改操作，适合用于产品演示。
详细权限说明请查看 [测试账户文档](/TEST_ACCOUNTS)
:::

## 验证安装

登录成功后，你可以：

1. 查看仪表盘统计数据
2. 浏览系统管理各个模块
3. 查看 API 文档：`http://localhost:8080/api-docs`
4. 检查健康状态：`http://localhost:8080/api/health`

## 常见问题

### 数据库连接失败

**错误信息**：`Can't reach database server`

**解决方案**：
1. 确认 PostgreSQL 服务已启动
2. 检查 `config/index.ts` 中的数据库配置
3. 确认数据库已创建

### 端口被占用

**错误信息**：`Port 8080 is already in use`

**解决方案**：
1. 修改 `server/src/config/index.ts` 中的端口配置
2. 或停止占用端口的进程

### Prisma 客户端未生成

**错误信息**：`Cannot find module '@prisma/client'`

**解决方案**：
```bash
cd server
pnpm prisma:generate
```

### Redis 连接失败

**错误信息**：`Redis connection failed`

**解决方案**：
1. 确认 Redis 服务已启动
2. 检查 `config/index.ts` 中的 Redis 配置

## 下一步

- [目录结构](/guide/directory-structure) - 了解项目结构
- [多租户架构](/guide/multi-tenant) - 深入理解多租户
- [开始开发](/development/getting-started) - 开始开发新功能
- [API 开发](/development/api) - 学习 API 开发

## 获取帮助

如果遇到问题，可以：

1. 查看 [常见问题](/guide/faq)
2. 提交 [GitHub Issue](https://github.com/linlingqin77/Nest-Admin-Soybean/issues)
3. 查看项目文档
