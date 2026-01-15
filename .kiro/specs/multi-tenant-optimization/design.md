# Design Document: Multi-Tenant Architecture Optimization

## Overview

本设计文档描述了 NestJS 后端多租户架构优化和测试覆盖率提升的技术方案。主要目标包括：

1. 将已弃用的 Prisma `$use` 中间件迁移到 `$extends` API
2. 优化租户上下文管理和数据隔离机制
3. 完善 `@IgnoreTenant` 装饰器的使用规范
4. 提升核心服务的测试覆盖率到企业级标准（80%+）
5. 实现属性测试验证核心逻辑的正确性

## Architecture

### 当前架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TenantHttpMiddleware                          │
│  - 从 Header 提取 tenant-id                                      │
│  - 初始化 TenantContext (AsyncLocalStorage)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TenantGuard                                │
│  - 检查 @IgnoreTenant 装饰器                                     │
│  - 设置 ignoreTenant 标志                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Controller / Service                          │
│  - 业务逻辑处理                                                  │
│  - 可使用 @IgnoreTenant 跳过租户过滤                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PrismaService                               │
│  - $use(createTenantMiddleware()) [已弃用]                       │
│  - 自动注入租户过滤条件                                          │
│  - 自动设置 tenantId 字段                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 目标架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Request                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TenantHttpMiddleware                          │
│  - 从 Header 提取 tenant-id                                      │
│  - 初始化 TenantContext (AsyncLocalStorage)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TenantGuard                                │
│  - 检查 @IgnoreTenant 装饰器                                     │
│  - 设置 ignoreTenant 标志                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Controller / Service                          │
│  - 业务逻辑处理                                                  │
│  - 可使用 @IgnoreTenant 跳过租户过滤                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ExtendedPrismaClient                             │
│  - 使用 $extends API 替代 $use                                   │
│  - query 扩展拦截所有数据库操作                                  │
│  - 自动注入租户过滤条件                                          │
│  - 自动设置 tenantId 字段                                        │
│  - 验证 findUnique 结果的租户归属                                │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. TenantContext (租户上下文)

```typescript
// server/src/tenant/context/tenant.context.ts

interface TenantContextData {
  tenantId: string;
  ignoreTenant?: boolean;
  requestId?: string;
}

class TenantContext {
  private static storage: AsyncLocalStorage<TenantContextData>;
  
  static readonly SUPER_TENANT_ID = '000000';
  
  // 核心方法
  static run<T>(data: TenantContextData, fn: () => T): T;
  static runWithTenant<T>(tenantId: string, fn: () => T, options?: { ignoreTenant?: boolean }): T;
  static runIgnoringTenant<T>(fn: () => T): T;
  
  // 访问方法
  static getTenantId(): string | undefined;
  static setTenantId(tenantId: string): void;
  static getRequestId(): string | undefined;
  static isIgnoreTenant(): boolean;
  static setIgnoreTenant(ignore: boolean): void;
  static getStore(): TenantContextData | undefined;
  
  // 判断方法
  static isSuperTenant(): boolean;
  static hasContext(): boolean;
  static shouldApplyTenantFilter(): boolean;
}
```

### 2. Prisma Extension (Prisma 扩展)

```typescript
// server/src/tenant/extensions/tenant.extension.ts

import { Prisma, PrismaClient } from '@prisma/client';
import { TenantContext } from '../context/tenant.context';
import { hasTenantField, SUPER_TENANT_ID } from '../constants/tenant-models';

/**
 * 创建租户扩展的 Prisma 客户端
 */
export function createTenantExtension(prisma: PrismaClient) {
  return prisma.$extends({
    name: 'tenant-extension',
    query: {
      $allModels: {
        // 查询操作：添加租户过滤
        async findMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        async findFirst({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        async findUnique({ model, args, query }) {
          const result = await query(args);
          return validateTenantOwnership(model, result);
        },
        
        async count({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        // 创建操作：设置租户ID
        async create({ model, args, query }) {
          if (hasTenantField(model)) {
            args.data = setTenantId(model, args.data);
          }
          return query(args);
        },
        
        async createMany({ model, args, query }) {
          if (hasTenantField(model)) {
            args.data = setTenantIdForMany(model, args.data);
          }
          return query(args);
        },
        
        // 更新操作：添加租户过滤
        async update({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        async updateMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        // 删除操作：添加租户过滤
        async delete({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        async deleteMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(model, args.where);
          }
          return query(args);
        },
        
        // upsert 操作
        async upsert({ model, args, query }) {
          if (hasTenantField(model)) {
            args.create = setTenantId(model, args.create);
            if (shouldApplyFilter(model)) {
              args.where = addTenantFilter(model, args.where);
            }
          }
          return query(args);
        },
      },
    },
  });
}

// 辅助函数
function shouldApplyFilter(model: string): boolean {
  return hasTenantField(model) && TenantContext.shouldApplyTenantFilter();
}

function addTenantFilter(model: string, where: any): any {
  const tenantId = TenantContext.getTenantId();
  if (!tenantId) return where;
  
  return {
    ...where,
    tenantId,
  };
}

function setTenantId(model: string, data: any): any {
  const tenantId = TenantContext.getTenantId() || SUPER_TENANT_ID;
  return {
    ...data,
    tenantId: data.tenantId || tenantId,
  };
}

function setTenantIdForMany(model: string, data: any[]): any[] {
  const tenantId = TenantContext.getTenantId() || SUPER_TENANT_ID;
  return data.map(item => ({
    ...item,
    tenantId: item.tenantId || tenantId,
  }));
}

function validateTenantOwnership(model: string, result: any): any {
  if (!result || !hasTenantField(model)) return result;
  if (TenantContext.isIgnoreTenant() || TenantContext.isSuperTenant()) return result;
  
  const currentTenantId = TenantContext.getTenantId();
  if (currentTenantId && result.tenantId !== currentTenantId) {
    return null;
  }
  return result;
}
```

### 3. PrismaService 更新

```typescript
// server/src/infrastructure/prisma/prisma.service.ts

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createTenantExtension } from 'src/tenant/extensions/tenant.extension';
import { createSlowQueryExtension } from './slow-query.extension';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _client: ReturnType<typeof this.createExtendedClient>;

  constructor(private readonly config: AppConfigService) {
    this._client = this.createExtendedClient();
  }

  private createExtendedClient() {
    const baseClient = new PrismaClient({
      datasources: {
        db: {
          url: this.buildConnectionString(),
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    // 使用 $extends 链式扩展
    return baseClient
      .$extends(createTenantExtension(baseClient))
      .$extends(createSlowQueryExtension());
  }

  // 代理所有 Prisma 模型访问
  get user() { return this._client.sysUser; }
  get role() { return this._client.sysRole; }
  get dept() { return this._client.sysDept; }
  // ... 其他模型

  async onModuleInit() {
    await this._client.$connect();
    this.logger.log('Prisma connected to PostgreSQL successfully.');
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
    this.logger.log('Prisma connection closed successfully.');
  }
}
```

### 4. @IgnoreTenant 装饰器使用规范

```typescript
// 使用场景示例

// 1. 控制器方法级别 - 公开接口
@Controller('auth')
export class AuthController {
  @Get('tenant/list')
  @NotRequireAuth()
  @IgnoreTenant()  // 登录页面需要获取所有租户列表
  async getTenantList() { ... }
}

// 2. 服务方法级别 - 跨租户操作
@Injectable()
export class TenantService {
  @IgnoreTenant()  // 租户管理需要跨租户查询
  async findAll(query: ListTenantRequestDto) { ... }
  
  @IgnoreTenant()  // 验证企业名称是否已存在
  async create(dto: CreateTenantRequestDto) { ... }
}

// 3. 定时任务 - 跨租户批量操作
@Injectable()
export class TaskService {
  @Cron('0 0 * * *')
  @IgnoreTenant()  // 定时任务需要处理所有租户
  async storageQuotaAlert() { ... }
}

// 4. 编程式忽略租户 - 临时跨租户操作
async function someOperation() {
  // 使用 TenantContext.runIgnoringTenant
  const allTenants = await TenantContext.runIgnoringTenant(async () => {
    return this.prisma.sysTenant.findMany();
  });
}
```

## Data Models

### 租户相关数据模型

```prisma
// 租户表
model SysTenant {
  id            Int       @id @default(autoincrement())
  tenantId      String    @unique @db.VarChar(20)
  companyName   String    @db.VarChar(50)
  contactUserName String? @db.VarChar(20)
  contactPhone  String?   @db.VarChar(20)
  packageId     Int?
  expireTime    DateTime?
  accountCount  Int       @default(10)
  storageQuota  Int       @default(1024)  // MB
  apiQuota      Int       @default(-1)    // -1 表示无限制
  storageUsed   Int       @default(0)     // MB
  status        String    @default("0") @db.Char(1)
  delFlag       String    @default("0") @db.Char(1)
  remark        String?   @db.VarChar(500)
  createTime    DateTime  @default(now())
  updateTime    DateTime  @updatedAt
  
  @@map("sys_tenant")
}

// 租户功能开关表
model SysTenantFeature {
  id          Int       @id @default(autoincrement())
  tenantId    String    @db.VarChar(20)
  featureKey  String    @db.VarChar(100)
  enabled     Boolean   @default(false)
  config      String?   @db.Text
  createTime  DateTime  @default(now())
  updateTime  DateTime  @updatedAt
  
  @@unique([tenantId, featureKey])
  @@map("sys_tenant_feature")
}

// 租户使用统计表
model SysTenantUsage {
  id          Int       @id @default(autoincrement())
  tenantId    String    @db.VarChar(20)
  date        DateTime  @db.Date
  apiCalls    Int       @default(0)
  storageUsed Int       @default(0)
  userCount   Int       @default(0)
  
  @@unique([tenantId, date])
  @@map("sys_tenant_usage")
}
```

### 需要租户隔离的模型

```typescript
// server/src/tenant/constants/tenant-models.ts

export const TENANT_MODELS = [
  'SysUser',
  'SysRole',
  'SysDept',
  'SysMenu',
  'SysPost',
  'SysConfig',
  'SysDict',
  'SysDictData',
  'SysNotice',
  'SysOperLog',
  'SysLoginLog',
  'SysJob',
  'SysJobLog',
  'SysFile',
  // ... 其他需要租户隔离的模型
] as const;

export function hasTenantField(model: string): boolean {
  return TENANT_MODELS.includes(model as any);
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 租户上下文切换往返一致性

*For any* 有效的租户ID，在 `runWithTenant` 内部调用 `getTenantId()` 应该返回该租户ID，且操作完成后原上下文应该恢复。

**Validates: Requirements 1.3, 1.5, 1.6, 9.1, 9.4**

### Property 2: 租户数据隔离

*For any* 包含 tenantId 字段的数据模型和任意查询操作，在非超级租户且未设置 ignoreTenant 的情况下，查询结果只应包含当前租户的数据。

**Validates: Requirements 3.2, 4.4**

### Property 3: 跳过租户过滤

*For any* 设置了 ignoreTenant 标志或超级租户身份的查询操作，应该能够访问所有租户的数据。

**Validates: Requirements 4.2, 4.3**

### Property 4: 租户ID生成格式

*For any* 生成的租户ID，格式应该为6位数字字符串，且值应该大于等于 100001。

**Validates: Requirements 5.1, 9.2, 9.5**

### Property 5: 配额检查正确性

*For any* 租户配额检查操作，当当前使用量小于配额上限时应该返回 allowed=true，当使用量大于等于配额上限时应该返回 allowed=false（配额为 -1 表示无限制，始终返回 allowed=true）。

**Validates: Requirements 6.3, 6.4, 9.3**

### Property 6: 创建记录自动设置租户ID

*For any* 在租户上下文中创建的记录，如果模型包含 tenantId 字段，则记录的 tenantId 应该等于当前上下文的租户ID。

**Validates: Requirements 3.3**

### Property 7: findUnique 租户归属验证

*For any* findUnique 操作返回的结果，如果结果的 tenantId 与当前上下文的租户ID不匹配（且非超级租户、未设置 ignoreTenant），应该返回 null。

**Validates: Requirements 4.5**

### Property 8: 功能开关租户隔离

*For any* 租户的功能开关设置，应该只影响该租户，不影响其他租户的功能开关状态。

**Validates: Requirements 6.1**

## Error Handling

### 租户相关错误码

```typescript
// server/src/shared/response/response-code.ts

export enum ResponseCode {
  // 租户相关错误码 (4000-4999)
  TENANT_NOT_FOUND = 4001,      // 租户不存在
  TENANT_DISABLED = 4002,       // 租户已禁用
  TENANT_EXPIRED = 4003,        // 租户已过期
  TENANT_DELETED = 4004,        // 租户已删除
  TENANT_QUOTA_EXCEEDED = 4005, // 租户配额超限
  TENANT_FEATURE_DISABLED = 4006, // 租户功能未启用
  TENANT_ID_REQUIRED = 4007,    // 租户ID必填
  TENANT_ID_INVALID = 4008,     // 租户ID无效
}
```

### 异常处理流程

```typescript
// server/src/tenant/exceptions/tenant.exception.ts

export class TenantException extends BusinessException {
  constructor(code: ResponseCode, message?: string) {
    super(code, message || TenantException.getDefaultMessage(code));
  }

  private static getDefaultMessage(code: ResponseCode): string {
    const messages: Record<number, string> = {
      [ResponseCode.TENANT_NOT_FOUND]: '租户不存在',
      [ResponseCode.TENANT_DISABLED]: '租户已被停用，请联系管理员',
      [ResponseCode.TENANT_EXPIRED]: '租户已过期，请联系管理员续费',
      [ResponseCode.TENANT_DELETED]: '租户已被删除',
      [ResponseCode.TENANT_QUOTA_EXCEEDED]: '租户配额已用尽',
      [ResponseCode.TENANT_FEATURE_DISABLED]: '该功能未启用',
      [ResponseCode.TENANT_ID_REQUIRED]: '租户ID不能为空',
      [ResponseCode.TENANT_ID_INVALID]: '租户ID格式无效',
    };
    return messages[code] || '租户操作失败';
  }
}
```

## Testing Strategy

### 测试框架配置

- **单元测试**: Jest + fast-check (属性测试)
- **集成测试**: Jest + Supertest
- **覆盖率目标**: 
  - 全局: 行覆盖率 80%, 分支覆盖率 70%, 函数覆盖率 75%
  - 租户模块: 行覆盖率 85%, 分支覆盖率 75%, 函数覆盖率 80%
  - 安全模块: 行覆盖率 90%, 分支覆盖率 80%, 函数覆盖率 85%

### 属性测试配置

```typescript
// 每个属性测试最少运行 100 次迭代
const PBT_CONFIG = { numRuns: 100 };

// 租户ID生成器
const tenantIdArb = fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 6, maxLength: 6 })
  .filter(id => parseInt(id, 10) >= 100001);

// 有效租户上下文数据生成器
const tenantContextDataArb = fc.record({
  tenantId: tenantIdArb,
  ignoreTenant: fc.boolean(),
  requestId: fc.uuid(),
});
```

### 测试文件组织

```
server/test/
├── unit/
│   └── tenant/
│       ├── context/
│       │   ├── tenant.context.spec.ts      # 单元测试
│       │   └── tenant.context.pbt.spec.ts  # 属性测试
│       ├── services/
│       │   ├── tenant-lifecycle.service.spec.ts
│       │   ├── feature-toggle.service.spec.ts
│       │   ├── quota.service.spec.ts
│       │   └── quota.service.pbt.spec.ts   # 配额属性测试
│       ├── guards/
│       │   └── tenant.guard.spec.ts
│       └── extensions/
│           ├── tenant.extension.spec.ts
│           └── tenant.extension.pbt.spec.ts # 数据隔离属性测试
├── integration/
│   └── tenant/
│       ├── tenant-lifecycle.integration.spec.ts
│       ├── tenant-isolation.integration.spec.ts
│       └── tenant-quota.integration.spec.ts
└── fixtures/
    └── tenant.fixture.ts
```

### 单元测试与属性测试的互补

- **单元测试**: 验证具体示例、边界条件和错误处理
- **属性测试**: 验证通用属性在所有有效输入下的正确性
- 两者结合提供全面的测试覆盖
