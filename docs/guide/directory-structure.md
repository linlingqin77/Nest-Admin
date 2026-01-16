# 目录结构

了解项目的目录结构有助于快速定位文件和理解项目架构。

## 整体结构

```
Nest-Admin-Soybean/
├── admin-naive-ui/          # 前端项目（Vue 3 + Vite）
├── server/                  # 后端项目（NestJS）
├── docs/                    # VitePress 文档站点
├── logs/                    # 日志文件目录
├── upload/                  # 上传文件目录
├── README.md                # 项目说明
└── CHANGELOG.md             # 版本变更日志
```

## 后端目录结构

```
server/
├── src/                     # 源代码目录
│   ├── config/              # 配置管理
│   │   └── index.ts         # 统一配置文件
│   │
│   ├── core/                # 核心模块
│   │   ├── decorators/      # 自定义装饰器
│   │   ├── filters/         # 异常过滤器
│   │   ├── guards/          # 守卫（认证、权限）
│   │   ├── interceptors/    # 拦截器（日志、转换）
│   │   ├── middleware/      # 中间件
│   │   └── pipes/           # 管道（验证、转换）
│   │
│   ├── infrastructure/      # 基础设施
│   │   ├── cache/           # 缓存服务
│   │   ├── prisma/          # Prisma 配置
│   │   ├── repository/      # 仓储层
│   │   └── dataloader/      # 数据加载器
│   │
│   ├── module/              # 业务模块
│   │   ├── main/            # 主模块（认证）
│   │   ├── system/          # 系统管理
│   │   │   ├── config/      # 系统配置
│   │   │   ├── dept/        # 部门管理
│   │   │   ├── dict/        # 字典管理
│   │   │   ├── job/         # 定时任务
│   │   │   ├── logininfor/  # 登录日志
│   │   │   ├── menu/        # 菜单管理
│   │   │   ├── notice/      # 通知公告
│   │   │   ├── operlog/     # 操作日志
│   │   │   ├── post/        # 岗位管理
│   │   │   ├── role/        # 角色管理
│   │   │   └── user/        # 用户管理
│   │   ├── upload/          # 文件上传
│   │   ├── tenant/          # 租户管理
│   │   └── monitor/         # 系统监控
│   │
│   ├── observability/       # 可观测性
│   │   ├── audit/           # 审计日志
│   │   ├── health/          # 健康检查
│   │   └── metrics/         # 性能指标
│   │
│   ├── resilience/          # 弹性模块
│   │   └── circuit-breaker/ # 熔断器
│   │
│   ├── security/            # 安全模块
│   │   ├── crypto/          # 加密服务
│   │   └── login/           # 登录服务
│   │
│   ├── shared/              # 共享模块
│   │   ├── constants/       # 常量定义
│   │   ├── dto/             # 通用 DTO
│   │   ├── entity/          # 实体定义
│   │   ├── enum/            # 枚举定义
│   │   ├── exceptions/      # 异常处理
│   │   ├── response/        # 响应格式
│   │   ├── utils/           # 工具函数
│   │   └── validators/      # 验证器
│   │
│   ├── tenant/              # 多租户模块
│   │   ├── context/         # 租户上下文
│   │   ├── middleware/      # 租户中间件
│   │   └── services/        # 租户服务
│   │
│   ├── test-utils/          # 测试工具
│   │
│   ├── app.module.ts        # 应用主模块
│   └── main.ts              # 应用入口
│
├── test/                    # 测试文件（统一存放）
│   ├── unit/                # 单元测试
│   │   ├── config/          # 配置模块测试
│   │   ├── core/            # 核心模块测试
│   │   ├── infrastructure/  # 基础设施测试
│   │   ├── module/          # 业务模块测试
│   │   ├── observability/   # 可观测性测试
│   │   ├── resilience/      # 弹性模块测试
│   │   ├── security/        # 安全模块测试
│   │   ├── shared/          # 共享模块测试
│   │   └── tenant/          # 租户模块测试
│   ├── integration/         # 集成测试
│   │   ├── auth/            # 认证集成测试
│   │   ├── user/            # 用户集成测试
│   │   └── tenant/          # 租户集成测试
│   ├── e2e/                 # E2E 测试
│   │   ├── auth.e2e-spec.ts
│   │   ├── user.e2e-spec.ts
│   │   └── system.e2e-spec.ts
│   ├── fixtures/            # 测试数据工厂
│   │   ├── user.fixture.ts
│   │   ├── role.fixture.ts
│   │   └── tenant.fixture.ts
│   ├── helpers/             # 测试辅助函数
│   │   ├── test-helper.ts
│   │   ├── mock-factory.ts
│   │   └── assertion-helpers.ts
│   ├── mocks/               # Mock 实现
│   │   ├── prisma.mock.ts
│   │   ├── redis.mock.ts
│   │   └── config.mock.ts
│   └── setup.ts             # 全局测试设置
│
├── prisma/                  # Prisma ORM 配置
│   ├── schema.prisma        # 数据库 Schema
│   ├── migrations/          # 数据库迁移文件
│   ├── seeds/               # 种子数据
│   └── seed.ts              # 数据初始化脚本
│
├── keys/                    # RSA 密钥对
│   ├── private.pem          # 私钥
│   └── public.pem           # 公钥
│
├── scripts/                 # 脚本工具
│   ├── deploy.cjs           # 部署脚本
│   ├── ecosystem.config.cjs # PM2 配置
│   ├── generate-rsa-keys.cjs# 生成 RSA 密钥
│   └── init-demo.sh         # 初始化演示账户
│
├── docs/                    # 文档
├── coverage/                # 测试覆盖率报告
├── .env.development         # 开发环境配置
├── .env.production          # 生产环境配置
├── jest.config.js           # Jest 配置
├── nest-cli.json            # NestJS CLI 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 依赖管理
```

### 核心模块说明

#### 1. common/ - 公共模块

- **decorators/**: 自定义装饰器
  - `@NotRequireAuth()` - 跳过认证
  - `@RequirePermission()` - 权限验证
  - `@User()` - 注入当前用户
  - `@IgnoreTenant()` - 跳过租户过滤

- **guards/**: 守卫模块
  - `TenantGuard` - 租户上下文设置
  - `JwtAuthGuard` - JWT 认证
  - `RolesGuard` - 角色验证
  - `PermissionGuard` - 权限验证

- **interceptors/**: 拦截器
  - `DecryptInterceptor` - 请求解密
  - `TransformInterceptor` - 响应转换
  - `LoggingInterceptor` - 日志记录

- **tenant/**: 多租户模块
  - `tenant.extension.ts` - Prisma 租户扩展
  - `tenant.context.ts` - 租户上下文管理

#### 2. module/ - 业务模块

每个业务模块通常包含：

```
module/
└── feature/
    ├── feature.module.ts      # 模块定义
    ├── feature.controller.ts  # 控制器（路由）
    ├── feature.service.ts     # 业务逻辑
    ├── dto/                   # 数据传输对象
    │   ├── create-feature.dto.ts
    │   ├── update-feature.dto.ts
    │   └── query-feature.dto.ts
    └── vo/                    # 视图对象
        └── feature.vo.ts
```

## 前端目录结构

```
admin-naive-ui/
├── src/                     # 源代码
│   ├── assets/              # 静态资源
│   ├── components/          # 全局组件
│   ├── constants/           # 常量定义
│   ├── enum/                # 枚举
│   ├── hooks/               # 组合式函数
│   ├── layouts/             # 布局组件
│   ├── locales/             # 国际化
│   ├── plugins/             # 插件
│   ├── router/              # 路由配置
│   ├── service/             # API 服务
│   │   ├── api/             # API 定义
│   │   ├── api-gen/         # 自动生成的 API
│   │   └── request/         # 请求封装
│   ├── store/               # Pinia 状态管理
│   │   ├── modules/         # 状态模块
│   │   └── plugins/         # 状态插件
│   ├── styles/              # 全局样式
│   ├── theme/               # 主题配置
│   ├── typings/             # TypeScript 类型
│   │   ├── api/             # API 类型
│   │   └── api-gen/         # 自动生成的类型
│   ├── utils/               # 工具函数
│   ├── views/               # 页面组件
│   │   ├── _builtin/        # 内置页面（404、403）
│   │   ├── home/            # 首页
│   │   ├── system/          # 系统管理
│   │   │   ├── user/        # 用户管理
│   │   │   ├── role/        # 角色管理
│   │   │   ├── menu/        # 菜单管理
│   │   │   └── ...
│   │   ├── monitor/         # 系统监控
│   │   └── tool/            # 系统工具
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
│
├── test/                    # 测试文件
│   ├── unit/                # 单元测试
│   │   ├── utils/           # 工具函数测试
│   │   ├── hooks/           # Composables 测试
│   │   └── store/           # Pinia Store 测试
│   ├── components/          # 组件测试
│   │   ├── common/          # 通用组件测试
│   │   └── advanced/        # 高级组件测试
│   ├── fixtures/            # 测试数据
│   │   ├── user.fixture.ts
│   │   └── api-response.fixture.ts
│   ├── mocks/               # Mock 实现
│   │   ├── handlers.ts      # MSW handlers
│   │   └── server.ts        # MSW server
│   ├── helpers/             # 测试辅助函数
│   │   ├── mount.helper.ts
│   │   └── assertion.helper.ts
│   └── setup.ts             # 测试设置
│
├── cypress/                 # Cypress E2E 测试
│   ├── e2e/                 # E2E 测试用例
│   │   └── auth.cy.ts
│   ├── fixtures/            # Cypress 测试数据
│   └── support/             # Cypress 支持文件
│
├── packages/                # 内部包（monorepo）
│   ├── alova/               # Alova 请求
│   ├── axios/               # Axios 封装
│   ├── color/               # 颜色工具
│   ├── hooks/               # 通用 Hooks
│   ├── utils/               # 工具函数
│   ├── materials/           # UI 组件
│   ├── ofetch/              # ofetch 封装
│   ├── scripts/             # 构建脚本
│   ├── tinymce/             # 富文本编辑器
│   └── uno-preset/          # UnoCSS 预设
│
├── build/                   # 构建配置
│   ├── config/              # 配置文件
│   └── plugins/             # Vite 插件
│
├── public/                  # 公共资源
├── coverage/                # 测试覆盖率报告
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── vitest.config.ts         # Vitest 配置
├── cypress.config.ts        # Cypress 配置
├── uno.config.ts            # UnoCSS 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 依赖管理
```

### 前端核心目录说明

#### 1. service/ - API 服务层

```
service/
├── api/                     # API 接口定义
│   ├── auth.ts              # 认证接口
│   ├── system/              # 系统管理接口
│   │   ├── user.ts
│   │   ├── role.ts
│   │   └── ...
│   └── monitor/             # 监控接口
└── request/                 # 请求封装
    ├── instance.ts          # Axios 实例
    └── encrypt.ts           # 加密工具
```

#### 2. store/ - 状态管理

```
store/
├── modules/                 # 状态模块
│   ├── auth/                # 认证状态
│   ├── route/               # 路由状态
│   ├── tab/                 # 标签页状态
│   └── theme/               # 主题状态
└── subscribe/               # 状态订阅
```

#### 3. views/ - 页面组件

采用文件路由系统，文件结构自动生成路由：

```
views/
├── _builtin/                # 内置页面
│   ├── 404/                 # 404 页面
│   └── 403/                 # 403 页面
├── home/                    # 首页
│   └── index.vue
├── system/                  # 系统管理
│   ├── user/                # 用户管理
│   │   └── index.vue
│   ├── role/                # 角色管理
│   │   └── index.vue
│   └── menu/                # 菜单管理
│       └── index.vue
└── monitor/                 # 系统监控
    └── online/              # 在线用户
        └── index.vue
```

## 配置文件说明

### 后端配置

- **config/index.ts**: 统一配置入口
  - 数据库配置 (`db.postgresql`)
  - Redis 配置 (`redis`)
  - JWT 配置 (`jwt`)
  - 加密配置 (`encrypt`)
  - 日志配置 (`log`)

- **prisma/schema.prisma**: 数据库 Schema
  - 定义数据表结构
  - 配置关系映射
  - 设置索引和约束

### 前端配置

- **vite.config.ts**: Vite 构建配置
- **uno.config.ts**: UnoCSS 原子化 CSS 配置
- **tsconfig.json**: TypeScript 编译配置
- **.env.***: 环境变量配置

## 重要文件位置

| 功能 | 文件位置 |
|------|---------|
| 后端配置 | `server/src/config/index.ts` |
| 数据库 Schema | `server/prisma/schema.prisma` |
| 数据初始化 | `server/prisma/seed.ts` |
| 多租户上下文 | `server/src/tenant/context/tenant.context.ts` |
| 多租户中间件 | `server/src/tenant/middleware/tenant.middleware.ts` |
| 请求加密 | `server/src/core/interceptors/decrypt.interceptor.ts` |
| 权限守卫 | `server/src/core/guards/permission.guard.ts` |
| 响应格式 | `server/src/shared/response/result.ts` |
| 后端测试配置 | `server/jest.config.js` |
| 前端 API | `admin-naive-ui/src/service/api/` |
| 前端路由 | `admin-naive-ui/src/router/` |
| 前端状态 | `admin-naive-ui/src/store/` |
| 前端测试配置 | `admin-naive-ui/vitest.config.ts` |
| E2E 测试配置 | `admin-naive-ui/cypress.config.ts` |

## 测试文件命名规范

| 测试类型 | 命名格式 | 示例 |
|---------|---------|------|
| 单元测试 | `*.spec.ts` | `user.service.spec.ts` |
| 属性测试 | `*.pbt.spec.ts` | `response-format.pbt.spec.ts` |
| 集成测试 | `*.integration.spec.ts` | `auth.integration.spec.ts` |
| E2E 测试 | `*.e2e-spec.ts` | `auth.e2e-spec.ts` |
| 前端组件测试 | `*.test.ts` | `Button.test.ts` |
| Cypress E2E | `*.cy.ts` | `auth.cy.ts` |

## 下一步

- [多租户架构](/guide/multi-tenant) - 了解多租户实现
- [RBAC 权限系统](/guide/rbac) - 了解权限系统
- [开始开发](/development/getting-started) - 开始开发新功能
