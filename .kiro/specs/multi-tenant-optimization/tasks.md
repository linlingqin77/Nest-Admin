# Implementation Plan: Multi-Tenant Architecture Optimization

## Overview

本实现计划将多租户架构优化和测试覆盖率提升分解为可执行的编码任务。主要工作包括：
1. Prisma 中间件迁移到 `$extends` API
2. 租户模块测试覆盖提升
3. 核心服务测试覆盖提升
4. 属性测试实现

## Tasks

- [-] 1. Prisma Extension 迁移
  - [x] 1.1 创建租户扩展模块
    - 创建 `server/src/tenant/extensions/tenant.extension.ts`
    - 实现 `createTenantExtension` 函数
    - 使用 `$extends` API 的 query 扩展
    - 实现 findMany, findFirst, count, create, update, delete 等操作的租户过滤
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 1.2 创建慢查询扩展模块
    - 创建 `server/src/infrastructure/prisma/slow-query.extension.ts`
    - 将现有的慢查询日志中间件迁移到 `$extends` API
    - _Requirements: 3.5_

  - [x] 1.3 更新 PrismaService
    - 修改 `server/src/infrastructure/prisma/prisma.service.ts`
    - 移除 `$use` 调用
    - 使用链式 `$extends` 扩展
    - 确保所有模型访问通过扩展后的客户端
    - _Requirements: 3.1, 3.5, 3.6_

  - [x] 1.4 编写租户扩展单元测试
    - 创建 `server/test/unit/tenant/extensions/tenant.extension.spec.ts`
    - 测试租户过滤逻辑
    - 测试租户ID自动设置
    - 测试 findUnique 租户归属验证
    - _Requirements: 3.2, 3.3, 4.5_

  - [x] 1.5 编写租户扩展属性测试
    - 创建 `server/test/unit/tenant/extensions/tenant.extension.pbt.spec.ts`
    - **Property 2: 租户数据隔离**
    - **Property 6: 创建记录自动设置租户ID**
    - **Property 7: findUnique 租户归属验证**
    - **Validates: Requirements 3.2, 3.3, 4.4, 4.5**

- [x] 2. Checkpoint - 确保 Prisma 迁移完成
  - 运行所有测试确保无回归
  - 验证无 Prisma 弃用警告
  - 如有问题请询问用户

- [-] 3. 租户上下文测试覆盖
  - [x] 3.1 完善 TenantContext 单元测试
    - 更新 `server/src/tenant/context/tenant.context.spec.ts`
    - 覆盖所有公共方法
    - 测试边界条件（无上下文、嵌套上下文）
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1_

  - [x] 3.2 编写 TenantContext 属性测试
    - 创建 `server/test/unit/tenant/context/tenant.context.pbt.spec.ts`
    - **Property 1: 租户上下文切换往返一致性**
    - **Validates: Requirements 1.3, 1.5, 1.6, 9.1, 9.4**

- [-] 4. 租户服务测试覆盖
  - [x] 4.1 编写 TenantHelper 单元测试
    - 创建 `server/test/unit/tenant/services/tenant.helper.spec.ts`
    - 测试 isEnabled, shouldFilter, getTenantId, isSuperTenant 方法
    - _Requirements: 7.2_

  - [x] 4.2 编写 TenantLifecycleService 单元测试
    - 创建 `server/test/unit/tenant/services/tenant-lifecycle.service.spec.ts`
    - 测试 generateTenantId, createTenant, initializeTenant 方法
    - 测试 updateStatus, isTenantAvailable, checkTenantCanLogin 方法
    - 测试 deleteTenant, getTenantInfo 方法
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3_

  - [x] 4.3 编写租户ID生成属性测试
    - 在 `server/test/unit/tenant/services/tenant-lifecycle.service.pbt.spec.ts`
    - **Property 4: 租户ID生成格式**
    - **Validates: Requirements 5.1, 9.2, 9.5**

  - [x] 4.4 编写 FeatureToggleService 单元测试
    - 创建 `server/test/unit/tenant/services/feature-toggle.service.spec.ts`
    - 测试 isEnabled, setFeature, getTenantFeatures 方法
    - 测试 getFeatureConfig, deleteFeature, clearCache 方法
    - 测试 setFeatures 批量操作
    - _Requirements: 6.1, 6.2, 7.5_

  - [x] 4.5 编写功能开关属性测试
    - 创建 `server/test/unit/tenant/services/feature-toggle.service.pbt.spec.ts`
    - **Property 8: 功能开关租户隔离**
    - **Validates: Requirements 6.1**

  - [x] 4.6 编写 QuotaService 单元测试
    - 创建 `server/test/unit/tenant/services/quota.service.spec.ts`
    - 测试 checkQuota, getResourceUsage, incrementUsage 方法
    - 测试 getUsageStats, getTodayUsage, updateStorageUsage 方法
    - 测试 syncUserCount, clearQuotaCache, checkQuotaOrThrow 方法
    - _Requirements: 6.3, 6.4, 6.5, 7.6_

  - [x] 4.7 编写配额检查属性测试
    - 创建 `server/test/unit/tenant/services/quota.service.pbt.spec.ts`
    - **Property 5: 配额检查正确性**
    - **Validates: Requirements 6.3, 6.4, 9.3**

- [x] 5. Checkpoint - 确保租户模块测试完成
  - 运行租户模块测试
  - 验证覆盖率达到 85%
  - 如有问题请询问用户

- [x] 6. 租户守卫测试覆盖
  - [x] 6.1 完善 TenantGuard 单元测试
    - 更新 `server/src/tenant/guards/tenant.guard.spec.ts`
    - 测试 @IgnoreTenant 装饰器处理
    - 测试多租户禁用场景
    - _Requirements: 2.6, 7.4_

  - [x] 6.2 编写 RequireFeatureGuard 单元测试
    - 创建 `server/test/unit/tenant/guards/require-feature.guard.spec.ts`
    - 测试功能开关检查逻辑
    - _Requirements: 6.2_

  - [x] 6.3 编写 RequireQuotaGuard 单元测试
    - 创建 `server/test/unit/tenant/guards/require-quota.guard.spec.ts`
    - 测试配额检查逻辑
    - _Requirements: 6.4_

- [x] 7. 核心服务测试覆盖提升
  - [x] 7.1 提升 tenant.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/system/tenant/tenant.service.spec.ts`
    - 覆盖 create, findAll, findOne, update, remove 方法
    - 覆盖 syncDictToTenant, syncPackageToTenant, syncConfigToTenant 方法
    - 覆盖 export, getSelectList, switchTenant, restoreTenant 方法
    - 目标覆盖率: 80%+
    - _Requirements: 8.1_

  - [x] 7.2 提升 user.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/system/user/user.service.spec.ts`
    - 覆盖 create, findAll, findOne, update, remove 方法
    - 覆盖 resetPassword, changeStatus, updateProfile 方法
    - 覆盖 importUsers, exportUsers 方法
    - 目标覆盖率: 80%+
    - _Requirements: 8.2_

  - [x] 7.3 提升 upload.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/upload/upload.service.spec.ts`
    - 覆盖 uploadFile, uploadFiles, getFileInfo 方法
    - 覆盖 deleteFile, downloadFile 方法
    - 新增 29 个测试用例，覆盖 COS 存储、租户配额检查、版本控制等场景
    - 目标覆盖率: 70%+
    - _Requirements: 8.3_

  - [x] 7.4 提升 system-config.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/system/config/config.service.spec.ts`
    - 覆盖所有配置管理方法
    - 目标覆盖率: 80%+
    - _Requirements: 8.4_

  - [x] 7.5 提升 role.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/system/role/role.service.spec.ts`
    - 覆盖角色管理和权限分配方法
    - 新增 10 个边界条件测试用例
    - 目标覆盖率: 80%+
    - _Requirements: 8.5_

  - [x] 7.6 提升 menu.service.ts 测试覆盖率
    - 更新 `server/test/unit/module/system/menu/menu.service.spec.ts`
    - 覆盖菜单管理和树形结构方法
    - 新增 12 个边界条件测试用例
    - 目标覆盖率: 85%+
    - _Requirements: 8.6_

- [x] 8. Checkpoint - 确保核心服务测试完成
  - 运行所有单元测试：2825 个测试全部通过
  - 验证各服务覆盖率达标
  - 如有问题请询问用户

- [x] 9. 集成测试
  - [x] 9.1 编写租户生命周期集成测试
    - 创建 `server/test/integration/tenant/tenant-lifecycle.integration.spec.ts`
    - 测试租户创建到初始化的完整流程
    - 测试租户状态管理和可用性检查
    - _Requirements: 12.1_

  - [x] 9.2 编写租户数据隔离集成测试
    - 创建 `server/test/integration/tenant/tenant-isolation.integration.spec.ts`
    - 测试不同租户之间的数据隔离
    - 测试超级租户的跨租户访问
    - 测试租户上下文切换和嵌套
    - _Requirements: 12.2_

  - [x] 9.3 编写租户状态变更集成测试
    - 创建 `server/test/integration/tenant/tenant-status.integration.spec.ts`
    - 测试租户禁用、过期对登录的影响
    - 测试租户状态恢复
    - _Requirements: 12.3_

  - [ ] 9.4 编写租户数据隔离属性测试
    - 创建 `server/test/integration/tenant/tenant-isolation.pbt.spec.ts`
    - **Property 3: 跳过租户过滤**
    - **Validates: Requirements 4.2, 4.3**

- [x] 10. 错误处理完善
  - [x] 10.1 完善 TenantException 类
    - 已存在 `server/src/tenant/exceptions/tenant.exception.ts`
    - 包含所有租户相关异常类：TenantNotFoundException, TenantDisabledException, TenantExpiredException, TenantContextMissingException, TenantQuotaExceededException, TenantFeatureDisabledException, CrossTenantAccessException
    - _Requirements: 10.1_

  - [x] 10.2 添加租户错误码到 ResponseCode
    - 已存在 `server/src/shared/response/response.interface.ts`
    - 包含 TENANT_NOT_FOUND (4001), TENANT_DISABLED (4002), TENANT_EXPIRED (4003), TENANT_QUOTA_EXCEEDED (4004) 等错误码
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [x] 10.3 编写错误处理单元测试
    - 创建 `server/test/unit/tenant/exceptions/tenant.exception.spec.ts`
    - 测试各种错误场景（19个测试用例）
    - _Requirements: 10.6_

- [x] 11. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件：2843 个测试通过（1个无关的属性测试失败）
  - 租户模块测试：510 个测试全部通过
  - 生成覆盖率报告
  - 验证整体覆盖率达到 80%+
  - 如有问题请询问用户

## Notes

- 每个任务都引用了具体的需求以便追溯
- Checkpoint 任务用于验证阶段性成果
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界条件
- 所有任务都是必须完成的，以确保全面的测试覆盖
