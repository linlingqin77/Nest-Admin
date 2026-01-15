# Requirements Document

## Introduction

本规范定义了 NestJS 后端多租户架构优化和测试覆盖率提升的需求。目标是优化现有多租户实现的架构设计，提高代码可维护性和可测试性，同时将整体测试覆盖率从当前的 67% 提升到企业级标准（80%+）。

**重要变更**: 当前项目使用已弃用的 `this.$use(createTenantMiddleware())` 方法注册 Prisma 中间件，需要迁移到 Prisma Client Extensions API (`$extends`)。

## Glossary

- **Tenant_Context**: 租户上下文，使用 AsyncLocalStorage 在异步操作中传递租户信息的核心组件
- **Tenant_Helper**: 租户帮助类，提供租户相关的辅助方法
- **Tenant_Lifecycle_Service**: 租户生命周期服务，管理租户的创建、初始化、状态变更等操作
- **Tenant_Guard**: 租户守卫，验证请求中的租户信息
- **Feature_Toggle_Service**: 功能开关服务，控制租户级别的功能启用/禁用
- **Quota_Service**: 配额服务，管理租户资源配额
- **Prisma_Extension**: Prisma 客户端扩展，使用 `$extends` API 实现租户过滤（替代已弃用的 `$use` 中间件）
- **Super_Tenant**: 超级租户（ID: 000000），拥有跨租户访问权限
- **Property_Based_Testing**: 属性测试，使用 fast-check 库验证代码在各种输入下的正确性

## Requirements

### Requirement 1: 租户上下文管理优化

**User Story:** As a 开发者, I want 租户上下文管理更加健壮和可测试, so that 我可以安全地在异步操作中传递租户信息并轻松编写测试。

#### Acceptance Criteria

1. THE Tenant_Context SHALL 提供类型安全的上下文数据访问方法
2. WHEN 在没有租户上下文的情况下调用 getTenantId THEN THE Tenant_Context SHALL 返回 undefined 而不是抛出异常
3. WHEN 使用 runWithTenant 切换租户执行操作 THEN THE Tenant_Context SHALL 在操作完成后自动恢复原上下文
4. WHEN 使用 runIgnoringTenant 执行跨租户操作 THEN THE Tenant_Context SHALL 正确设置 ignoreTenant 标志
5. THE Tenant_Context SHALL 支持嵌套的租户上下文切换
6. FOR ALL 有效的租户上下文操作, 执行 runWithTenant 后再获取 tenantId SHALL 返回切换后的租户ID

### Requirement 2: @IgnoreTenant 装饰器使用规范

**User Story:** As a 开发者, I want 清晰的 @IgnoreTenant 装饰器使用规范, so that 我知道何时以及如何正确使用跨租户查询功能。

#### Acceptance Criteria

1. THE @IgnoreTenant 装饰器 SHALL 用于需要跨租户查询的服务方法
2. WHEN 平台管理员需要查看所有租户数据 THEN THE 方法 SHALL 使用 @IgnoreTenant 装饰器
3. WHEN 租户注册时验证企业名称是否已存在 THEN THE 方法 SHALL 使用 @IgnoreTenant 装饰器
4. WHEN 登录时根据用户名查找用户（可能属于不同租户） THEN THE 方法 SHALL 使用 @IgnoreTenant 装饰器
5. THE @IgnoreTenant 装饰器 SHALL 可以应用于控制器方法或服务方法
6. WHEN 使用 @IgnoreTenant 装饰器 THEN THE TenantGuard SHALL 设置 ignoreTenant 标志为 true

### Requirement 3: Prisma 中间件迁移到扩展 API

**User Story:** As a 开发者, I want 将已弃用的 Prisma `$use` 中间件迁移到 `$extends` API, so that 代码符合最新的 Prisma 最佳实践并消除弃用警告。

#### Acceptance Criteria

1. THE PrismaService SHALL 使用 `$extends` API 替代已弃用的 `$use` 方法
2. WHEN 执行数据库查询 THEN THE Prisma_Extension SHALL 自动注入租户过滤条件
3. WHEN 创建新记录 THEN THE Prisma_Extension SHALL 自动设置 tenantId 字段
4. THE Prisma_Extension SHALL 支持 query 扩展用于拦截和修改查询
5. THE Prisma_Extension SHALL 保持与现有租户过滤逻辑的兼容性
6. WHEN 迁移完成 THEN THE System SHALL 无任何 Prisma 弃用警告

### Requirement 4: 租户数据隔离增强

**User Story:** As a 系统管理员, I want 租户数据完全隔离, so that 不同租户的数据不会相互泄露。

#### Acceptance Criteria

1. IF 租户ID缺失或无效 THEN THE Tenant_Guard SHALL 拒绝请求并返回适当的错误码
2. WHEN 超级租户执行查询 THEN THE Prisma_Extension SHALL 不添加租户过滤条件
3. WHEN 设置 ignoreTenant 标志 THEN THE Prisma_Extension SHALL 跳过租户过滤
4. FOR ALL 包含 tenantId 字段的数据模型, 查询结果 SHALL 只包含当前租户的数据
5. THE findUnique 操作 SHALL 在返回结果后验证租户归属

### Requirement 5: 租户生命周期管理

**User Story:** As a 平台管理员, I want 完整的租户生命周期管理功能, so that 我可以创建、初始化、禁用和删除租户。

#### Acceptance Criteria

1. WHEN 创建新租户 THEN THE Tenant_Lifecycle_Service SHALL 生成唯一的租户ID（6位数字，从100001开始）
2. WHEN 初始化租户 THEN THE Tenant_Lifecycle_Service SHALL 创建默认部门、管理员角色和管理员用户
3. WHEN 更新租户状态 THEN THE Tenant_Lifecycle_Service SHALL 验证租户存在性并记录状态变更
4. WHEN 检查租户可用性 THEN THE Tenant_Lifecycle_Service SHALL 验证删除标志、状态和过期时间
5. IF 租户已过期 THEN THE Tenant_Lifecycle_Service SHALL 自动更新状态为过期并拒绝登录
6. WHEN 软删除租户 THEN THE Tenant_Lifecycle_Service SHALL 设置 delFlag 为 '2' 而不是物理删除

### Requirement 6: 功能开关和配额管理

**User Story:** As a 产品经理, I want 基于租户的功能开关和配额管理, so that 我可以为不同租户提供差异化的服务。

#### Acceptance Criteria

1. THE Feature_Toggle_Service SHALL 支持租户级别的功能启用/禁用
2. WHEN 检查功能是否启用 THEN THE Feature_Toggle_Service SHALL 先检查租户配置再检查全局配置
3. THE Quota_Service SHALL 支持用户数量、存储空间等资源配额管理
4. WHEN 资源使用超过配额 THEN THE Quota_Service SHALL 拒绝操作并返回配额超限错误
5. IF 租户套餐变更 THEN THE Quota_Service SHALL 更新对应的配额限制

### Requirement 7: 租户服务测试覆盖

**User Story:** As a 开发者, I want 租户模块有完整的测试覆盖, so that 我可以确保多租户功能的正确性和稳定性。

#### Acceptance Criteria

1. THE Tenant_Context 单元测试 SHALL 覆盖所有公共方法和边界条件
2. THE Tenant_Helper 单元测试 SHALL 验证租户过滤逻辑的正确性
3. THE Tenant_Lifecycle_Service 单元测试 SHALL 覆盖创建、初始化、状态变更等操作
4. THE Tenant_Guard 单元测试 SHALL 验证请求验证逻辑
5. THE Feature_Toggle_Service 单元测试 SHALL 验证功能开关逻辑
6. THE Quota_Service 单元测试 SHALL 验证配额检查和更新逻辑
7. WHEN 运行租户模块测试 THEN 行覆盖率 SHALL 达到 85% 以上

### Requirement 8: 核心服务测试覆盖提升

**User Story:** As a 开发者, I want 核心业务服务有更高的测试覆盖率, so that 我可以确保系统的稳定性和可靠性。

#### Acceptance Criteria

1. THE tenant.service.ts 测试覆盖率 SHALL 从当前的 46% 提升到 80% 以上
2. THE user.service.ts 测试覆盖率 SHALL 从当前的 40% 提升到 80% 以上
3. THE upload.service.ts 测试覆盖率 SHALL 从当前的 16% 提升到 70% 以上
4. THE system-config.service.ts 测试覆盖率 SHALL 从当前的 59% 提升到 80% 以上
5. THE role.service.ts 测试覆盖率 SHALL 从当前的 67% 提升到 80% 以上
6. THE menu.service.ts 测试覆盖率 SHALL 从当前的 76% 提升到 85% 以上

### Requirement 9: 属性测试实现

**User Story:** As a 开发者, I want 使用属性测试验证核心逻辑, so that 我可以发现边界条件和边缘情况的问题。

#### Acceptance Criteria

1. THE Tenant_Context 属性测试 SHALL 验证租户切换的往返一致性
2. THE Tenant_ID_Generator 属性测试 SHALL 验证生成的ID格式和唯一性
3. THE Quota_Checker 属性测试 SHALL 验证配额计算的正确性
4. FOR ALL 有效的租户上下文, 执行 runWithTenant 然后 getTenantId SHALL 返回设置的租户ID
5. FOR ALL 生成的租户ID, 格式 SHALL 为6位数字字符串

### Requirement 10: 错误处理和异常管理

**User Story:** As a 开发者, I want 统一的租户相关错误处理, so that 我可以提供一致的错误响应。

#### Acceptance Criteria

1. THE Tenant_Exception SHALL 提供租户相关的专用异常类型
2. WHEN 租户不存在 THEN THE System SHALL 返回 TENANT_NOT_FOUND 错误码
3. WHEN 租户已禁用 THEN THE System SHALL 返回 TENANT_DISABLED 错误码
4. WHEN 租户已过期 THEN THE System SHALL 返回 TENANT_EXPIRED 错误码
5. WHEN 配额超限 THEN THE System SHALL 返回 QUOTA_EXCEEDED 错误码
6. IF 发生租户相关异常 THEN THE System SHALL 记录详细的错误日志

### Requirement 11: 性能优化

**User Story:** As a 系统管理员, I want 多租户系统有良好的性能, so that 系统可以支持大量租户同时使用。

#### Acceptance Criteria

1. THE Tenant_Context SHALL 使用 AsyncLocalStorage 实现零性能开销的上下文传递
2. THE Prisma_Extension SHALL 使用索引优化租户过滤查询
3. THE Feature_Toggle_Service SHALL 缓存功能开关配置以减少数据库查询
4. THE Quota_Service SHALL 缓存配额信息以提高检查效率
5. WHEN 租户配置变更 THEN THE Cache SHALL 自动失效并刷新

### Requirement 12: 集成测试覆盖

**User Story:** As a 开发者, I want 多租户功能有完整的集成测试, so that 我可以验证各组件之间的协作正确性。

#### Acceptance Criteria

1. THE 集成测试 SHALL 验证租户创建到初始化的完整流程
2. THE 集成测试 SHALL 验证租户数据隔离的正确性
3. THE 集成测试 SHALL 验证租户状态变更对登录的影响
4. THE 集成测试 SHALL 验证功能开关和配额限制的实际效果
5. WHEN 运行集成测试 THEN 所有测试用例 SHALL 通过
