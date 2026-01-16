# Design Document: 租户模块测试覆盖率提升

## Overview

本设计文档定义了提高租户模块测试覆盖率的技术方案。重点关注租户数据隔离的正确性验证，通过单元测试、属性测试和集成测试三个层次确保租户隔离功能的可靠性。

测试策略遵循测试金字塔原则：
- **单元测试 (70%)**: 测试各个服务和组件的独立功能
- **属性测试 (PBT)**: 验证租户隔离的核心属性在各种输入下都成立
- **集成测试 (20%)**: 验证组件间交互和真实数据库操作

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        测试架构                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    集成测试层                             │   │
│  │  - 真实数据库操作验证                                      │   │
│  │  - 端到端租户隔离验证                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    属性测试层 (PBT)                       │   │
│  │  - 租户切换数据隔离属性                                    │   │
│  │  - 上下文嵌套属性                                         │   │
│  │  - 过滤器一致性属性                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    单元测试层                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │TenantContext │  │TenantHelper  │  │TenantGuard   │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │Lifecycle     │  │QuotaService  │  │Relation      │   │   │
│  │  │Service       │  │              │  │Validation    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────────┐                     │   │
│  │  │Middleware    │  │Extension     │                     │   │
│  │  └──────────────┘  └──────────────┘                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 测试文件结构

```
server/test/
├── unit/
│   └── tenant/
│       ├── context/
│       │   └── tenant.context.spec.ts
│       ├── services/
│       │   ├── tenant.helper.spec.ts
│       │   ├── tenant-lifecycle.service.spec.ts
│       │   ├── quota.service.spec.ts
│       │   └── relation-validation.service.spec.ts
│       ├── middleware/
│       │   └── tenant.middleware.spec.ts
│       ├── extensions/
│       │   └── tenant.extension.spec.ts
│       └── guards/
│           └── tenant.guard.spec.ts
├── pbt/
│   └── tenant/
│       ├── tenant-isolation.pbt.spec.ts
│       └── tenant-context.pbt.spec.ts
└── integration/
    └── tenant/
        └── tenant-isolation.integration.spec.ts
```

### 2. Mock 工厂

```typescript
// test/mocks/tenant.mock.ts
interface MockTenantConfig {
  enabled: boolean;
  superTenantId: string;
  defaultTenantId: string;
}

interface MockPrismaService {
  sysTenant: MockPrismaModel;
  sysUser: MockPrismaModel;
  sysRole: MockPrismaModel;
  sysDept: MockPrismaModel;
  // ... 其他模型
}

interface MockRedisService {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  getClient: jest.Mock;
}
```

### 3. 测试辅助函数

```typescript
// test/helpers/tenant-test.helper.ts
interface TenantTestHelper {
  // 在指定租户上下文中运行测试
  runWithTenant<T>(tenantId: string, fn: () => T): T;
  
  // 在忽略租户过滤的上下文中运行测试
  runIgnoringTenant<T>(fn: () => T): T;
  
  // 创建测试用租户数据
  createTestTenant(overrides?: Partial<TenantData>): TenantData;
  
  // 生成随机租户ID
  generateTenantId(): string;
}
```

## Data Models

### 测试数据模型

```typescript
// 租户测试数据
interface TenantTestData {
  tenantId: string;
  companyName: string;
  status: '0' | '1' | '2';
  delFlag: '0' | '2';
  expireTime?: Date;
  accountCount: number;
}

// 用户测试数据
interface UserTestData {
  userId: number;
  tenantId: string;
  userName: string;
  status: '0' | '1';
  delFlag: '0' | '2';
}

// 配额测试数据
interface QuotaTestData {
  tenantId: string;
  resource: 'users' | 'storage' | 'api_calls';
  quota: number;
  currentUsage: number;
}
```

### fast-check 生成器

```typescript
// 租户ID生成器
const tenantIdArb = fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 6, maxLength: 6 });

// 非超级租户ID生成器
const normalTenantIdArb = tenantIdArb.filter(id => id !== '000000');

// 租户对生成器（用于隔离测试）
const tenantPairArb = fc.tuple(normalTenantIdArb, normalTenantIdArb).filter(([a, b]) => a !== b);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*



### Property 1: Context Storage and Retrieval

*For any* valid tenantId (6-digit string), when TenantContext.run is called with that tenantId, TenantContext.getTenantId() within the callback SHALL return the same tenantId.

**Validates: Requirements 1.1, 1.2**

### Property 2: Context Nesting Isolation

*For any* two different tenantIds (A and B), when TenantContext.run is called with tenantId A, and within that callback TenantContext.run is called with tenantId B, after the inner callback completes, TenantContext.getTenantId() SHALL return tenantId A.

**Validates: Requirements 1.3, 8.3**

### Property 3: Tenant Switching Correctness

*For any* tenantId, when TenantContext.runWithTenant is called, the tenantId within the callback SHALL be the specified tenantId, and when TenantContext.runIgnoringTenant is called, isIgnoreTenant() SHALL return true.

**Validates: Requirements 1.4, 1.5**

### Property 4: Super Tenant Identification

*For any* tenantId, TenantContext.isSuperTenant() SHALL return true if and only if tenantId equals '000000'.

**Validates: Requirements 1.6**

### Property 5: Filter Application Logic

*For any* combination of (hasContext, ignoreTenant, isSuperTenant, hasTenantId), TenantContext.shouldApplyTenantFilter() SHALL return true only when hasContext=true AND ignoreTenant=false AND isSuperTenant=false AND hasTenantId=true.

**Validates: Requirements 1.7, 4.2**

### Property 6: Tenant Filter Injection

*For any* tenant model name and valid tenantId (not super tenant, not ignored), when addTenantFilter is called, the resulting where clause SHALL contain tenantId equal to the current context tenantId.

**Validates: Requirements 2.1, 3.1, 8.5**

### Property 7: TenantId Auto-Assignment

*For any* tenant model and data object without tenantId, when setTenantId is called within a tenant context, the resulting data SHALL have tenantId set to the current context tenantId.

**Validates: Requirements 2.2, 3.2, 8.2**

### Property 8: Filter Bypass Conditions

*For any* tenant model, when ignoreTenant is true OR current tenant is super tenant ('000000'), addTenantFilter SHALL NOT modify the where clause to add tenantId filter.

**Validates: Requirements 2.3, 2.4, 3.3, 3.4**

### Property 9: Non-Tenant Model Handling

*For any* non-tenant model name (e.g., 'GenTable', 'SysTenant'), addTenantFilter and setTenantId SHALL NOT modify the input arguments.

**Validates: Requirements 2.5**

### Property 10: Batch Create TenantId Assignment

*For any* array of data objects and tenant model, when setTenantIdForMany is called within a tenant context, ALL objects in the resulting array SHALL have tenantId set.

**Validates: Requirements 2.6**

### Property 11: Cross-Tenant Access Prevention

*For any* tenant model and result object with tenantId different from current context tenantId, validateTenantOwnership SHALL return null (unless ignoreTenant or super tenant).

**Validates: Requirements 2.7, 3.5, 8.1**

### Property 12: Quota Check Correctness

*For any* quota value and usage value:
- If quota is -1 (unlimited), allowed SHALL be true
- If usage < quota, allowed SHALL be true
- If usage >= quota, allowed SHALL be false

**Validates: Requirements 6.2, 6.3**

### Property 13: RequestId Preservation

*For any* nested TenantContext operations, if the outer context has a requestId, the inner context SHALL preserve that requestId. If no requestId exists, a new UUID SHALL be generated.

**Validates: Requirements 8.4**

## Error Handling

### 错误场景

| 场景 | 错误类型 | 处理方式 |
|------|---------|---------|
| 租户不存在 | BusinessException | 返回 NOT_FOUND 错误码 |
| 租户已停用 | BusinessException | 返回 FORBIDDEN 错误码 |
| 租户已过期 | BusinessException | 返回 FORBIDDEN 错误码 |
| 配额超限 | BusinessException | 返回 BAD_REQUEST 错误码 |
| 跨租户访问 | 静默处理 | 返回 null，记录警告日志 |
| 关联验证失败 | BadRequestException | 返回验证失败消息 |

### 测试错误处理

```typescript
// 测试错误抛出
it('should throw BusinessException when tenant is expired', async () => {
  await expect(service.checkTenantCanLogin('expired-tenant'))
    .rejects.toThrow(BusinessException);
});

// 测试静默处理
it('should return null for cross-tenant access', () => {
  const result = validateTenantOwnership('SysUser', { tenantId: 'other' });
  expect(result).toBeNull();
});
```

## Testing Strategy

### 测试框架配置

- **单元测试**: Jest + @nestjs/testing
- **属性测试**: fast-check (最少 100 次迭代)
- **集成测试**: Jest + 测试数据库
- **Mock 工具**: jest.mock, jest.fn

### 测试覆盖率目标

根据项目规范，租户模块作为核心安全模块，覆盖率目标：
- 分支覆盖率: 80%
- 函数覆盖率: 85%
- 行覆盖率: 90%
- 语句覆盖率: 90%

### 单元测试与属性测试的互补

**单元测试职责**:
- 测试特定示例和边界条件
- 测试错误处理和异常场景
- 测试与外部依赖的集成点
- 测试配置和初始化逻辑

**属性测试职责**:
- 验证租户隔离的核心属性
- 验证上下文管理的正确性
- 验证过滤器逻辑的一致性
- 验证配额计算的数学属性

### 属性测试配置

```typescript
// 每个属性测试最少 100 次迭代
fc.assert(
  fc.property(tenantIdArb, (tenantId) => {
    // 属性断言
  }),
  { numRuns: 100 }
);
```

### 测试标注格式

每个属性测试必须包含以下标注：
```typescript
/**
 * **Feature: tenant-test-coverage, Property N: Property Title**
 * **Validates: Requirements X.Y**
 */
```

### Mock 策略

1. **PrismaService**: 使用 jest.fn() mock 所有数据库操作
2. **RedisService**: 使用内存 Map 模拟缓存
3. **AppConfigService**: 使用固定配置对象
4. **Logger**: 使用 jest.fn() 静默日志

### 测试数据生成

使用 fast-check 生成器创建测试数据：

```typescript
// 租户ID生成器
const tenantIdArb = fc.stringOf(
  fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
  { minLength: 6, maxLength: 6 }
);

// 非超级租户ID生成器
const normalTenantIdArb = tenantIdArb.filter(id => id !== '000000');

// 租户对生成器
const tenantPairArb = fc.tuple(normalTenantIdArb, normalTenantIdArb)
  .filter(([a, b]) => a !== b);
```
