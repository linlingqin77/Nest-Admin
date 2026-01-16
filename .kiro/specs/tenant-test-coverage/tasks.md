# Implementation Plan: 租户模块测试覆盖率提升

## Overview

本实现计划将设计文档中的测试策略转化为具体的编码任务。按照测试金字塔原则，从单元测试开始，逐步添加属性测试和集成测试。

## Tasks

- [x] 1. 设置测试基础设施
  - [x] 1.1 创建租户测试辅助函数和 Mock 工厂
    - 创建 `test/helpers/tenant-test.helper.ts`
    - 创建 `test/mocks/tenant.mock.ts`
    - 包含 runWithTenant, runIgnoringTenant, createTestTenant 等辅助函数
    - 包含 MockPrismaService, MockRedisService, MockConfigService
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. TenantContext 单元测试
  - [x] 2.1 增强现有 TenantContext 测试
    - 补充 `server/src/tenant/context/tenant.context.spec.ts`
    - 添加 shouldApplyTenantFilter 测试
    - 添加 hasContext 测试
    - 添加 getRequestId 测试
    - _Requirements: 1.1, 1.2, 1.7_

  - [x]* 2.2 编写 TenantContext 属性测试
    - 创建 `server/test/pbt/tenant/tenant-context.pbt.spec.ts`
    - **Property 1: Context Storage and Retrieval**
    - **Property 2: Context Nesting Isolation**
    - **Property 3: Tenant Switching Correctness**
    - **Property 4: Super Tenant Identification**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 3. 租户中间件和扩展测试
  - [x] 3.1 创建租户中间件单元测试
    - 创建 `server/test/unit/tenant/middleware/tenant.middleware.spec.ts`
    - 测试 addTenantFilter 函数
    - 测试 setTenantId 函数
    - 测试 setTenantIdForMany 函数
    - 测试 validateTenantOwnership 函数
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.2 创建租户扩展单元测试
    - 创建 `server/test/unit/tenant/extensions/tenant.extension.spec.ts`
    - 测试 tenantExtensionHelpers 导出的函数
    - 测试 shouldApplyFilter 函数
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x]* 3.3 编写租户过滤属性测试
    - 创建 `server/test/pbt/tenant/tenant-filter.pbt.spec.ts`
    - **Property 5: Filter Application Logic**
    - **Property 6: Tenant Filter Injection**
    - **Property 7: TenantId Auto-Assignment**
    - **Property 8: Filter Bypass Conditions**
    - **Property 9: Non-Tenant Model Handling**
    - **Property 10: Batch Create TenantId Assignment**
    - **Validates: Requirements 1.7, 2.1-2.6, 3.1-3.4, 4.2, 8.2, 8.5**

- [x] 4. Checkpoint - 确保所有测试通过
  - 运行 `pnpm test` 确保所有测试通过
  - 如有问题请询问用户

- [x] 5. TenantHelper 单元测试
  - [x] 5.1 创建 TenantHelper 单元测试
    - 创建 `server/test/unit/tenant/services/tenant.helper.spec.ts`
    - 测试 isEnabled 方法
    - 测试 shouldFilter 方法
    - 测试 getTenantId 方法
    - 测试 isSuperTenant 方法
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. TenantLifecycleService 单元测试
  - [x] 6.1 创建 TenantLifecycleService 单元测试
    - 创建 `server/test/unit/tenant/services/tenant-lifecycle.service.spec.ts`
    - 测试 generateTenantId 方法
    - 测试 createTenant 方法
    - 测试 initializeTenant 方法
    - 测试 updateStatus 方法
    - 测试 isTenantAvailable 方法
    - 测试 checkTenantCanLogin 方法
    - 测试 deleteTenant 方法
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 7. TenantQuotaService 单元测试
  - [x] 7.1 创建 TenantQuotaService 单元测试
    - 创建 `server/test/unit/tenant/services/quota.service.spec.ts`
    - 测试 checkQuota 方法
    - 测试 getResourceUsage 方法
    - 测试 incrementUsage 方法
    - 测试 checkQuotaOrThrow 方法
    - 测试缓存逻辑
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 7.2 编写配额检查属性测试
    - 在 `server/test/pbt/tenant/quota.pbt.spec.ts` 中添加
    - **Property 12: Quota Check Correctness**
    - **Validates: Requirements 6.2, 6.3**

- [x] 8. RelationValidationService 单元测试
  - [x] 8.1 创建 RelationValidationService 单元测试
    - 创建 `server/test/unit/tenant/services/relation-validation.service.spec.ts`
    - 测试 validatePackageExists 方法
    - 测试 validateDeptExists 方法
    - 测试 validateRoleExists 方法
    - 测试 validateUserExists 方法
    - 测试 validateTenantExists 方法
    - 测试 checkDeptDependencies 方法
    - 测试 checkRoleDependencies 方法
    - 测试 checkPackageDependencies 方法
    - 测试 assertValid 方法
    - 测试 assertNoDependencies 方法
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 9. Checkpoint - 确保所有测试通过
  - 运行 `pnpm test` 确保所有测试通过
  - 如有问题请询问用户

- [ ] 10. 租户数据隔离属性测试
  - [ ]* 10.1 编写跨租户访问防护属性测试
    - 创建 `server/test/pbt/tenant/tenant-isolation.pbt.spec.ts`
    - **Property 11: Cross-Tenant Access Prevention**
    - **Property 13: RequestId Preservation**
    - **Validates: Requirements 2.7, 3.5, 8.1, 8.4**

- [x] 11. TenantGuard 单元测试增强
  - [x] 11.1 增强现有 TenantGuard 测试
    - 补充 `server/src/tenant/guards/tenant.guard.spec.ts`
    - 添加多守卫链测试
    - 添加边界条件测试
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12. 集成测试
  - [ ]* 12.1 创建租户数据隔离集成测试
    - 创建 `server/test/integration/tenant/tenant-isolation.integration.spec.ts`
    - 测试用户数据隔离
    - 测试角色数据隔离
    - 测试部门数据隔离
    - 测试超级租户访问
    - 测试 runIgnoringTenant 功能
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 13. Final Checkpoint - 确保所有测试通过并检查覆盖率
  - 运行 `pnpm test:cov` 检查覆盖率
  - 确保租户模块覆盖率达到目标 (90%)
  - 如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选任务，可以跳过以加快 MVP 开发
- 每个属性测试必须引用设计文档中的属性编号
- 属性测试最少运行 100 次迭代
- 集成测试需要测试数据库环境
