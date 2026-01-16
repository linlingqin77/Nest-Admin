# Requirements Document

## Introduction

本规范定义了提高租户模块测试覆盖率的需求，重点关注租户数据隔离的正确性验证。租户隔离是多租户系统的核心功能，必须确保不同租户之间的数据完全隔离，防止跨租户数据泄露。

当前租户模块包含以下核心组件：
- TenantContext: 租户上下文管理（AsyncLocalStorage）
- TenantMiddleware: Prisma 中间件实现租户过滤
- TenantExtension: Prisma 扩展实现租户过滤
- TenantHelper: 租户辅助方法
- TenantLifecycleService: 租户生命周期管理
- TenantQuotaService: 租户配额管理
- RelationValidationService: 关联验证服务
- TenantGuard: 租户守卫

## Glossary

- **Tenant**: 租户，系统中的独立组织单位，拥有独立的数据空间
- **TenantContext**: 租户上下文，使用 AsyncLocalStorage 在异步操作中传递租户信息
- **Super_Tenant**: 超级租户，ID 为 '000000'，可以访问所有租户数据
- **TenantId**: 租户标识符，6位数字字符串
- **Tenant_Isolation**: 租户隔离，确保不同租户的数据相互独立
- **Cross_Tenant_Access**: 跨租户访问，一个租户尝试访问另一个租户的数据
- **Tenant_Filter**: 租户过滤，在数据库查询中自动添加 tenantId 条件
- **Ignore_Tenant**: 忽略租户过滤，用于管理员跨租户操作
- **Quota**: 配额，租户可使用的资源上限
- **PBT**: Property-Based Testing，属性测试

## Requirements

### Requirement 1: TenantContext 单元测试

**User Story:** 作为开发者，我希望 TenantContext 有完整的单元测试覆盖，以确保租户上下文在各种场景下正确工作。

#### Acceptance Criteria

1. THE TenantContext SHALL correctly store and retrieve tenantId within a context
2. WHEN TenantContext.run is called with a tenantId, THE TenantContext SHALL make that tenantId available to all code within the callback
3. WHEN nested TenantContext.run calls occur, THE TenantContext SHALL maintain separate contexts for each nesting level
4. WHEN TenantContext.runWithTenant is called, THE TenantContext SHALL temporarily switch to the specified tenant
5. WHEN TenantContext.runIgnoringTenant is called, THE TenantContext SHALL set ignoreTenant to true
6. THE TenantContext.isSuperTenant SHALL return true only when tenantId equals '000000'
7. THE TenantContext.shouldApplyTenantFilter SHALL return false when no context exists, ignoreTenant is true, or is super tenant

### Requirement 2: 租户中间件数据隔离测试

**User Story:** 作为开发者，我希望租户中间件能正确过滤数据，确保租户之间的数据完全隔离。

#### Acceptance Criteria

1. WHEN a query is executed for a tenant model, THE Tenant_Middleware SHALL automatically add tenantId filter
2. WHEN data is created for a tenant model, THE Tenant_Middleware SHALL automatically set tenantId
3. WHEN ignoreTenant is true, THE Tenant_Middleware SHALL not add tenantId filter
4. WHEN the current tenant is Super_Tenant, THE Tenant_Middleware SHALL not add tenantId filter
5. WHEN a non-tenant model is queried, THE Tenant_Middleware SHALL not modify the query
6. WHEN batch data is created, THE Tenant_Middleware SHALL set tenantId for all records
7. WHEN findUnique returns data from another tenant, THE Tenant_Middleware SHALL return null to prevent Cross_Tenant_Access

### Requirement 3: 租户扩展数据隔离测试

**User Story:** 作为开发者，我希望租户扩展（Prisma Extension）能正确实现数据隔离，与中间件保持一致的行为。

#### Acceptance Criteria

1. FOR ALL tenant models and valid tenantIds, THE Tenant_Extension SHALL add tenantId filter to queries
2. FOR ALL tenant models, THE Tenant_Extension SHALL set tenantId when creating data
3. WHEN ignoreTenant is true, THE Tenant_Extension SHALL bypass tenant filtering
4. WHEN the current tenant is Super_Tenant, THE Tenant_Extension SHALL bypass tenant filtering
5. FOR ALL findUnique operations on tenant models, THE Tenant_Extension SHALL validate tenant ownership of results

### Requirement 4: TenantHelper 单元测试

**User Story:** 作为开发者，我希望 TenantHelper 的所有方法都有测试覆盖，确保辅助方法正确工作。

#### Acceptance Criteria

1. THE TenantHelper.isEnabled SHALL return the correct tenant enabled status from config
2. THE TenantHelper.shouldFilter SHALL return true only when tenant is enabled, not ignored, not super tenant, and has tenantId
3. THE TenantHelper.getTenantId SHALL return current tenantId or SUPER_TENANT_ID as default
4. THE TenantHelper.isSuperTenant SHALL correctly identify super tenant

### Requirement 5: TenantLifecycleService 单元测试

**User Story:** 作为开发者，我希望租户生命周期服务有完整的测试覆盖，确保租户创建、初始化、状态变更等操作正确执行。

#### Acceptance Criteria

1. WHEN generateTenantId is called, THE TenantLifecycleService SHALL return a unique 6-digit tenantId starting from '100001'
2. WHEN createTenant is called, THE TenantLifecycleService SHALL create a new tenant record with correct data
3. WHEN initializeTenant is called, THE TenantLifecycleService SHALL create default department, role, and admin user
4. WHEN updateStatus is called, THE TenantLifecycleService SHALL update tenant status correctly
5. WHEN isTenantAvailable is called, THE TenantLifecycleService SHALL check delFlag, status, and expireTime
6. WHEN checkTenantCanLogin is called with an expired tenant, THE TenantLifecycleService SHALL throw BusinessException
7. WHEN deleteTenant is called, THE TenantLifecycleService SHALL soft delete the tenant by setting delFlag to '2'

### Requirement 6: TenantQuotaService 单元测试

**User Story:** 作为开发者，我希望租户配额服务有完整的测试覆盖，确保配额检查和使用量统计正确工作。

#### Acceptance Criteria

1. WHEN checkQuota is called, THE TenantQuotaService SHALL return correct quota check result
2. WHEN quota is -1 (unlimited), THE TenantQuotaService SHALL always return allowed=true
3. WHEN current usage exceeds quota, THE TenantQuotaService SHALL return allowed=false
4. WHEN incrementUsage is called, THE TenantQuotaService SHALL increase usage count correctly
5. WHEN getResourceUsage is called, THE TenantQuotaService SHALL return correct usage from cache or database
6. WHEN checkQuotaOrThrow is called with exceeded quota, THE TenantQuotaService SHALL throw BusinessException

### Requirement 7: RelationValidationService 单元测试

**User Story:** 作为开发者，我希望关联验证服务有完整的测试覆盖，确保数据关联完整性验证正确工作。

#### Acceptance Criteria

1. WHEN validatePackageExists is called with non-existent packageId, THE RelationValidationService SHALL return valid=false
2. WHEN validatePackageExists is called with disabled package, THE RelationValidationService SHALL return valid=false
3. WHEN validateDeptExists is called with deleted department, THE RelationValidationService SHALL return valid=false
4. WHEN checkDeptDependencies is called, THE RelationValidationService SHALL return correct dependency count
5. WHEN checkRoleDependencies is called, THE RelationValidationService SHALL return correct user-role count
6. WHEN assertValid is called with invalid result, THE RelationValidationService SHALL throw BadRequestException

### Requirement 8: 租户切换数据隔离属性测试

**User Story:** 作为开发者，我希望通过属性测试验证租户切换时数据隔离的正确性，确保在任意租户切换场景下数据都能正确隔离。

#### Acceptance Criteria

1. FOR ALL pairs of different tenantIds, data created by one tenant SHALL NOT be visible to another tenant
2. FOR ALL tenantIds, data created within a tenant context SHALL have the correct tenantId set
3. FOR ALL nested tenant context switches, THE inner context SHALL not affect the outer context after completion
4. FOR ALL tenant context operations, THE requestId SHALL be preserved or generated correctly
5. FOR ALL tenant models and operations, THE tenant filter SHALL be applied consistently

### Requirement 9: TenantGuard 单元测试增强

**User Story:** 作为开发者，我希望 TenantGuard 有更完整的测试覆盖，包括边界条件和异常场景。

#### Acceptance Criteria

1. WHEN @IgnoreTenant decorator is present, THE TenantGuard SHALL set ignoreTenant to true
2. WHEN tenant feature is disabled, THE TenantGuard SHALL not process tenant logic
3. WHEN multiple guards are chained, THE TenantGuard SHALL maintain correct tenant context

### Requirement 10: 集成测试 - 租户数据隔离端到端验证

**User Story:** 作为开发者，我希望有集成测试验证租户数据隔离在真实数据库操作中的正确性。

#### Acceptance Criteria

1. WHEN a user is created in tenant A, THE user SHALL NOT be visible when querying from tenant B
2. WHEN a role is created in tenant A, THE role SHALL NOT be visible when querying from tenant B
3. WHEN a department is created in tenant A, THE department SHALL NOT be visible when querying from tenant B
4. WHEN super tenant queries data, THE super tenant SHALL see data from all tenants
5. WHEN runIgnoringTenant is used, THE query SHALL return data from all tenants
