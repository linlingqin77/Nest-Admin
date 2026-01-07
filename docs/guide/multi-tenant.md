# 多租户架构

Nest-Admin-Soybean 内置完善的企业级多租户数据隔离机制，支持 SaaS 模式运营。本文档将详细介绍多租户架构的设计和使用。

## 什么是多租户

多租户（Multi-Tenancy）是一种软件架构，允许单个应用实例为多个客户（租户）提供服务，同时确保每个租户的数据完全隔离和安全。

### 应用场景

- **SaaS 平台**: 为多个企业客户提供独立的管理系统
- **企业集团**: 为各个子公司提供统一的管理平台
- **代理商系统**: 为不同代理商提供独立的运营环境

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP 请求层                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           TenantHttpMiddleware                       │   │
│  │  - 从 JWT/Header/Query 提取租户ID                    │   │
│  │  - 初始化 TenantContext                              │   │
│  │  - 生成 requestId 用于链路追踪                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     租户上下文层                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TenantContext                           │   │
│  │  - AsyncLocalStorage 实现异步上下文传递              │   │
│  │  - 支持 runWithTenant() 临时切换租户                 │   │
│  │  - 支持 runIgnoringTenant() 跨租户操作               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据访问层                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Prisma Tenant Middleware                   │   │
│  │  - 自动注入 tenantId 过滤条件                        │   │
│  │  - 自动设置创建数据的 tenantId                       │   │
│  │  - findUnique 结果验证租户归属                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1. 租户识别

系统支持多种方式识别租户身份（优先级从高到低）：

1. **JWT Token** - 从已解析的用户信息中获取
2. **HTTP Header** - `x-tenant-id` 请求头
3. **Query Parameter** - `tenantId` 查询参数

```typescript
// 前端请求时自动添加租户 ID
axios.defaults.headers.common['x-tenant-id'] = '000000'
```

### 2. 租户上下文

使用 `AsyncLocalStorage` 实现租户上下文的异步传递：

```typescript
import { TenantContext } from 'src/tenant';

// 获取当前租户ID
const tenantId = TenantContext.getTenantId();

// 检查是否为超级租户
const isSuperTenant = TenantContext.isSuperTenant();

// 检查是否应该应用租户过滤
const shouldFilter = TenantContext.shouldApplyTenantFilter();

// 获取请求ID（用于链路追踪）
const requestId = TenantContext.getRequestId();
```

### 3. 自动数据过滤

Prisma 中间件自动为所有查询添加租户过滤：

```typescript
// 原始查询
const users = await prisma.sysUser.findMany({
  where: { status: '0' }
});

// 实际执行（自动添加租户过滤）
const users = await prisma.sysUser.findMany({
  where: { 
    status: '0',
    tenantId: '100001'  // 自动注入
  }
});
```

## 租户隔离模型

系统采用**共享数据库，共享 Schema** 的隔离模型：

| 隔离级别 | 说明 | 优点 | 缺点 |
|---------|------|------|------|
| 共享数据库，共享 Schema | 所有租户共用一个数据库和表，通过 tenantId 区分 | 资源利用率高，维护成本低 | 需要严格的数据隔离 |

### 为什么选择这种模型

1. **成本效益**: 单个数据库实例即可支持大量租户
2. **维护简单**: 数据库升级和维护只需操作一次
3. **横向扩展**: 可以通过分库分表进一步扩展
4. **性能优异**: Prisma 中间件在 ORM 层面实现，性能损耗极小

## 核心组件

### 1. TenantContext - 租户上下文

位置：`server/src/tenant/context/tenant.context.ts`

```typescript
import { TenantContext } from 'src/tenant';

// 在指定租户上下文中执行操作
TenantContext.run({ tenantId: '100001' }, () => {
  // 这里的所有数据库操作都会自动过滤到租户 100001
  await userService.findAll();
});

// 临时切换到其他租户执行操作
TenantContext.runWithTenant('100002', async () => {
  // 以租户 100002 的身份执行
  await userService.findAll();
});

// 忽略租户过滤执行操作（跨租户查询）
TenantContext.runIgnoringTenant(async () => {
  // 查询所有租户的数据
  await userService.findAll();
});
```

### 2. Prisma Tenant Middleware - 数据层中间件

位置：`server/src/tenant/middleware/tenant.middleware.ts`

自动处理的操作：

| 操作类型 | 处理方式 |
|---------|---------|
| findMany, findFirst, count | 自动添加 tenantId 过滤条件 |
| update, delete | 自动添加 tenantId 过滤条件 |
| create | 自动设置 tenantId 字段 |
| createMany | 批量设置 tenantId 字段 |
| upsert | 设置 create 的 tenantId，添加 where 过滤 |
| findUnique | 执行后验证结果的租户归属 |

### 3. TenantHttpMiddleware - HTTP 中间件

位置：`server/src/tenant/middleware/tenant-http.middleware.ts`

```typescript
// 在 AppModule 中配置
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantHttpMiddleware)
      .forRoutes('*');
  }
}
```

### 4. 租户隔离模型定义

位置：`server/src/tenant/constants/tenant-models.ts`

```typescript
// 需要租户隔离的模型列表
export const TENANT_MODELS = new Set<string>([
  'SysConfig',
  'SysDept',
  'SysDictData',
  'SysDictType',
  'SysJob',
  'SysLogininfor',
  'SysMenu',
  'SysNotice',
  'SysOperLog',
  'SysPost',
  'SysRole',
  'SysUpload',
  'SysUser',
  'SysFileFolder',
  'SysFileShare',
  'SysAuditLog',
  'SysTenantFeature',
  'SysTenantUsage',
]);

// 检查模型是否需要租户过滤
export function hasTenantField(model: string): boolean {
  return TENANT_MODELS.has(model);
}
```

## 高级功能

### 1. 租户生命周期管理

位置：`server/src/tenant/services/tenant-lifecycle.service.ts`

```typescript
import { TenantLifecycleService } from 'src/tenant';

// 创建新租户
const tenantId = await tenantLifecycleService.createTenant({
  companyName: '新公司',
  contactUserName: '张三',
  contactPhone: '13800138000',
  packageId: 1,
  accountCount: 10,
});

// 初始化租户基础数据（管理员、角色、部门）
await tenantLifecycleService.initializeTenant(tenantId, {
  adminUserName: 'admin',
  adminPassword: 'hashedPassword',
  adminNickName: '管理员',
});

// 检查租户是否可登录
await tenantLifecycleService.checkTenantCanLogin(tenantId);

// 更新租户状态
await tenantLifecycleService.updateStatus(tenantId, TenantStatus.DISABLED);
```

### 2. 功能开关服务

位置：`server/src/tenant/services/feature-toggle.service.ts`

```typescript
import { FeatureToggleService } from 'src/tenant';

// 检查功能是否启用
const enabled = await featureToggleService.isEnabled(tenantId, 'advanced_report');

// 设置功能开关
await featureToggleService.setFeature(tenantId, 'advanced_report', true);

// 批量设置功能开关
await featureToggleService.setFeatures(tenantId, {
  'advanced_report': true,
  'export_excel': true,
  'api_access': false,
});
```

使用守卫保护接口：

```typescript
import { RequireFeature } from 'src/tenant';

@RequireFeature({ feature: 'advanced_report' })
@Get('advanced-report')
async getAdvancedReport() {
  // 只有启用了 advanced_report 功能的租户才能访问
}
```

### 3. 配额管理服务

位置：`server/src/tenant/services/quota.service.ts`

```typescript
import { TenantQuotaService, QuotaResource } from 'src/tenant';

// 检查配额
const result = await quotaService.checkQuota(tenantId, QuotaResource.USERS);
// { allowed: true, currentUsage: 5, quota: 10, remaining: 5 }

// 检查配额并抛出异常
await quotaService.checkQuotaOrThrow(tenantId, QuotaResource.USERS);

// 增加使用量
await quotaService.incrementUsage(tenantId, QuotaResource.API_CALLS);
```

使用守卫保护接口：

```typescript
import { RequireQuota, QuotaResource } from 'src/tenant';

@RequireQuota({ resource: QuotaResource.USERS })
@Post()
async createUser() {
  // 只有配额未超限的租户才能创建用户
}
```

### 4. 关联验证服务

位置：`server/src/tenant/services/relation-validation.service.ts`

遵循阿里开发规范，不使用数据库外键，在应用层维护关联关系：

```typescript
import { RelationValidationService } from 'src/tenant';

// 验证部门是否存在
const result = await relationValidationService.validateDeptExists(deptId);
if (!result.valid) {
  throw new BadRequestException(result.message);
}

// 检查删除前的依赖关系
const deps = await relationValidationService.checkDeptDependencies(deptId);
if (deps.hasDependencies) {
  throw new BadRequestException(deps.message);
}

// 使用断言方法
relationValidationService.assertValid(result);
relationValidationService.assertNoDependencies(deps);
```

## 数据库模型

需要租户隔离的表必须包含 `tenantId` 字段：

```prisma
model SysUser {
  userId    Int      @id @default(autoincrement()) @map("user_id")
  tenantId  String   @map("tenant_id") @db.VarChar(20)
  userName  String   @map("user_name") @db.VarChar(50)
  // ... 其他字段
  
  @@index([tenantId])
  @@index([tenantId, userName])
  @@map("sys_user")
}
```

### 租户隔离的表

以下表包含租户隔离：

- SysUser - 用户表
- SysRole - 角色表
- SysDept - 部门表
- SysMenu - 菜单表
- SysPost - 岗位表
- SysDictType - 字典类型
- SysDictData - 字典数据
- SysConfig - 系统配置
- SysNotice - 通知公告
- SysJob - 定时任务
- SysOperLog - 操作日志
- SysLogininfor - 登录日志
- SysUpload - 文件上传
- SysTenantFeature - 租户功能开关
- SysTenantUsage - 租户使用统计

### 不需要租户隔离的表

- SysTenant - 租户表（全局）
- SysTenantPackage - 租户套餐（全局）

## 使用方法

### 基础使用

正常编写代码，系统会自动处理租户隔离：

```typescript
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  // 自动按当前租户过滤
  async findAll() {
    return this.prisma.sysUser.findMany();
  }
  
  // 自动添加当前租户 ID
  async create(data: CreateUserDto) {
    return this.prisma.sysUser.create({
      data: {
        userName: data.userName,
        // 不需要手动设置 tenantId
      }
    });
  }
}
```

### 跳过租户过滤

某些场景需要跨租户查询（如超级管理员），使用 `@IgnoreTenant()` 装饰器：

```typescript
import { IgnoreTenant } from 'src/tenant';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}
  
  // 查询所有租户（跨租户）
  @IgnoreTenant()
  async findAllTenants() {
    return this.prisma.sysTenant.findMany();
  }
}
```

或者使用 `TenantContext.runIgnoringTenant()`：

```typescript
async findAllTenants() {
  return TenantContext.runIgnoringTenant(async () => {
    return this.prisma.sysTenant.findMany();
  });
}
```

### 临时切换租户

某些特殊场景需要临时切换租户：

```typescript
async processForTenant(targetTenantId: string) {
  // 使用 runWithTenant 临时切换租户
  return TenantContext.runWithTenant(targetTenantId, async () => {
    // 这里的所有操作都以 targetTenantId 的身份执行
    return this.doSomething();
  });
  // 执行完成后自动恢复原租户上下文
}
```

## 超级管理员

租户 ID `000000` 为超级管理员租户，具有特殊权限：

```typescript
// 检查是否为超级管理员
if (TenantContext.isSuperTenant()) {
  // 超级管理员可以查看所有租户数据
}

// 超级管理员不受租户过滤限制
// 超级管理员不受配额限制
```

## 异常处理

位置：`server/src/tenant/exceptions/tenant.exception.ts`

```typescript
import {
  TenantNotFoundException,
  TenantDisabledException,
  TenantExpiredException,
  TenantContextMissingException,
  TenantQuotaExceededException,
  TenantFeatureDisabledException,
  CrossTenantAccessException,
} from 'src/tenant';

// 租户不存在
throw new TenantNotFoundException(tenantId);

// 租户已禁用
throw new TenantDisabledException(tenantId);

// 租户已过期
throw new TenantExpiredException(tenantId);

// 配额超限
throw new TenantQuotaExceededException('用户数', 10, 10);

// 功能未启用
throw new TenantFeatureDisabledException('advanced_report');

// 跨租户访问
throw new CrossTenantAccessException();
```

## 缓存隔离

位置：`server/src/tenant/constants/cache-keys.ts`

```typescript
import { 
  getFeatureCacheKey,
  getQuotaCacheKey,
  getUserCacheKey,
  getTenantCachePattern,
} from 'src/tenant';

// 生成租户隔离的缓存键
const featureKey = getFeatureCacheKey(tenantId);  // tenant:feature:100001
const userKey = getUserCacheKey(tenantId, userId); // user:info:100001:1

// 批量删除租户缓存
const pattern = getTenantCachePattern('user:info:', tenantId); // user:info:100001:*
```

## 类型定义

位置：`server/src/tenant/types/tenant.types.ts`

```typescript
import {
  ITenantContextData,
  ITenantInfo,
  ITenantPackage,
  PrismaQueryArgs,
  TenantModelName,
  ITenantEntity,
  TenantFilterOptions,
  FeatureCheckResult,
} from 'src/tenant';
```

## 注意事项

### 1. 索引优化

所有包含 `tenantId` 的表都应该在该字段上建立索引：

```prisma
model SysUser {
  // ...
  
  @@index([tenantId])
  @@index([tenantId, userName]) // 复合索引
}
```

### 2. 关联查询

Prisma 关联查询会自动应用租户过滤：

```typescript
// 自动过滤关联表的租户
const user = await prisma.sysUser.findMany({
  include: {
    roles: true,  // 自动过滤角色表的租户
    dept: true    // 自动过滤部门表的租户
  }
});
```

### 3. 原生 SQL

使用原生 SQL 时需要手动添加租户过滤：

```typescript
const tenantId = TenantContext.getTenantId();

const users = await prisma.$queryRaw`
  SELECT * FROM sys_user 
  WHERE tenant_id = ${tenantId}
`;
```

### 4. 事务处理

事务中的所有操作共享相同的租户上下文：

```typescript
await prisma.$transaction(async (tx) => {
  // 所有操作使用相同的租户 ID
  await tx.sysUser.create(userData);
  await tx.sysRole.create(roleData);
});
```

### 5. 不使用外键（阿里规范）

遵循阿里开发规范，不使用数据库外键约束，在应用层通过 `RelationValidationService` 维护关联关系。

## 性能优化

### 1. 数据库分区

对于大量租户的场景，可以使用 PostgreSQL 分区：

```sql
-- 按租户 ID 范围分区
CREATE TABLE sys_user (
  tenant_id VARCHAR(20),
  -- ...
) PARTITION BY RANGE (tenant_id);

CREATE TABLE sys_user_p1 PARTITION OF sys_user 
  FOR VALUES FROM ('000000') TO ('100000');
```

### 2. 读写分离

为每个租户配置主从数据库：

```typescript
// 根据租户 ID 选择数据源
const db = getTenantDatabase(tenantId);
```

### 3. 缓存策略

租户数据缓存需要包含租户 ID：

```typescript
const cacheKey = `tenant:${tenantId}:users`;
```

## 常见问题

### Q: 如何添加新的租户隔离表？

1. 在 Prisma Schema 中添加 `tenantId` 字段
2. 添加索引：`@@index([tenantId])`
3. 在 `TENANT_MODELS` 中添加模型名称
4. 运行迁移：`pnpm prisma:migrate`

### Q: 某些操作需要跨租户怎么办？

使用 `@IgnoreTenant()` 装饰器或 `TenantContext.runIgnoringTenant()`：

```typescript
@IgnoreTenant()
async crossTenantOperation() {
  // 这里的操作不会被租户过滤
}

// 或者
await TenantContext.runIgnoringTenant(async () => {
  // 跨租户操作
});
```

### Q: 如何测试多租户功能？

```typescript
// 在测试中使用 TenantContext.run
TenantContext.run({ tenantId: 'test-tenant' }, async () => {
  const users = await userService.findAll();
  expect(users.every(u => u.tenantId === 'test-tenant')).toBe(true);
});
```

## 下一步

- [RBAC 权限系统](/guide/rbac) - 了解权限控制
- [请求加密](/guide/encryption) - 了解数据加密
- [API 开发](/development/api) - 学习 API 开发
