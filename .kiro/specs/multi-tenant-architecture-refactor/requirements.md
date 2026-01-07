# Requirements Document

> **状态**: ✅ 已完成  
> **完成日期**: 2026-01-06  
> **实施版本**: v2.1.0

## Introduction

本文档定义了对现有 NestJS SaaS 多租户系统进行企业级架构重构的需求。目标是参考成熟的企业级 SaaS 多租户方案（如 Salesforce、阿里云、AWS），将现有系统升级为更加健壮、可扩展、安全的多租户架构。

## Glossary

- **Tenant**: 租户，系统中的独立客户实体，拥有独立的数据空间和配置
- **Super_Tenant**: 超级租户（000000），拥有跨租户管理权限的系统管理员租户
- **Tenant_Context**: 租户上下文，使用 AsyncLocalStorage 在请求生命周期内传递租户信息
- **Tenant_Isolation**: 租户隔离，确保不同租户数据完全隔离的机制
- **Tenant_Package**: 租户套餐，定义租户可使用的功能和资源配额
- **Feature_Toggle**: 功能开关，控制租户级别功能启用/禁用的机制
- **Quota_Service**: 配额服务，管理租户资源使用限制的服务
- **Data_Scope**: 数据权限范围，控制用户可访问数据范围的机制
- **Prisma_Middleware**: Prisma 中间件，在数据库操作前后自动注入租户过滤的机制
- **CLS**: Continuation Local Storage，异步上下文存储，用于在异步操作中传递上下文数据

## Requirements

### Requirement 1: 租户上下文管理增强

**User Story:** As a 系统架构师, I want 增强租户上下文管理能力, so that 租户信息能够在整个请求生命周期内安全、可靠地传递。

#### Acceptance Criteria

1. THE Tenant_Context SHALL 支持在 HTTP 请求、WebSocket 连接、定时任务、消息队列处理中统一传递租户信息
2. WHEN 请求进入系统时, THE Tenant_Middleware SHALL 从 JWT Token 或请求头中提取租户ID并注入上下文
3. THE Tenant_Context SHALL 提供类型安全的 API 获取和设置租户信息
4. WHEN 异步操作（如 Promise、setTimeout）执行时, THE Tenant_Context SHALL 保持租户信息不丢失
5. THE Tenant_Context SHALL 支持临时切换租户上下文执行跨租户操作（仅限超级管理员）
6. IF 租户上下文未初始化, THEN THE System SHALL 拒绝访问需要租户隔离的资源并返回明确错误

### Requirement 2: 数据库层租户隔离增强

**User Story:** As a 开发者, I want 数据库层自动处理租户隔离, so that 我不需要在每个查询中手动添加租户过滤条件。

#### Acceptance Criteria

1. THE Prisma_Middleware SHALL 自动为所有需要租户隔离的模型添加 tenantId 过滤条件
2. WHEN 创建数据时, THE Prisma_Middleware SHALL 自动设置当前租户的 tenantId
3. THE System SHALL 使用装饰器或 Schema 元数据自动检测需要租户隔离的模型，而非硬编码列表
4. WHEN 执行 findUnique 查询时, THE System SHALL 验证返回结果属于当前租户
5. THE System SHALL 支持在事务中保持租户隔离
6. WHEN 超级租户执行查询时, THE System SHALL 跳过租户过滤以支持跨租户管理
7. THE System SHALL 提供 @IgnoreTenant 装饰器允许特定操作跳过租户过滤

### Requirement 3: 租户套餐与功能管理

**User Story:** As a 平台运营者, I want 灵活管理租户套餐和功能权限, so that 我可以为不同级别的客户提供差异化服务。

#### Acceptance Criteria

1. THE Tenant_Package SHALL 定义租户可访问的菜单、功能和资源配额
2. WHEN 租户访问功能时, THE Feature_Toggle_Service SHALL 检查该功能是否在租户套餐中启用
3. THE System SHALL 支持动态启用/禁用租户功能而无需重启服务
4. THE Feature_Toggle_Service SHALL 使用 Redis 缓存功能开关状态以提升性能
5. WHEN 租户套餐变更时, THE System SHALL 自动更新租户的功能权限
6. THE System SHALL 提供 @RequireFeature 装饰器在 Controller/Service 层进行功能权限检查

### Requirement 4: 租户配额管理

**User Story:** As a 平台运营者, I want 管理租户的资源使用配额, so that 我可以控制成本并提供公平的服务。

#### Acceptance Criteria

1. THE Quota_Service SHALL 支持检查用户数、存储空间、API 调用量等资源配额
2. WHEN 资源使用达到配额上限时, THE System SHALL 拒绝新的资源请求并返回明确提示
3. THE System SHALL 实时统计租户资源使用情况并持久化到数据库
4. THE Quota_Service SHALL 使用 Redis 缓存配额信息以减少数据库查询
5. WHEN 租户配额变更时, THE System SHALL 自动清除相关缓存
6. THE System SHALL 支持配额预警，当使用量达到阈值时发送通知

### Requirement 5: 租户数据安全

**User Story:** As a 安全工程师, I want 确保租户数据完全隔离且安全, so that 不会发生跨租户数据泄露。

#### Acceptance Criteria

1. THE System SHALL 在所有数据访问层强制执行租户隔离
2. WHEN 用户尝试访问其他租户数据时, THE System SHALL 返回 403 Forbidden 错误
3. THE System SHALL 记录所有跨租户操作的审计日志
4. THE System SHALL 支持租户数据加密存储（敏感字段级别）
5. WHEN 租户被删除时, THE System SHALL 提供数据导出和安全删除机制
6. THE System SHALL 支持租户数据备份和恢复

### Requirement 6: 租户生命周期管理

**User Story:** As a 平台运营者, I want 管理租户的完整生命周期, so that 我可以高效地处理租户的创建、变更和注销。

#### Acceptance Criteria

1. WHEN 创建新租户时, THE System SHALL 自动初始化租户的基础数据（管理员账号、默认角色、默认部门等）
2. THE System SHALL 支持租户状态管理（正常、禁用、过期、待删除）
3. WHEN 租户状态变为禁用时, THE System SHALL 阻止该租户所有用户登录
4. THE System SHALL 支持租户到期自动处理（提醒、禁用、数据保留期）
5. WHEN 租户申请注销时, THE System SHALL 执行数据导出、数据清理、资源释放流程
6. THE System SHALL 提供租户数据迁移工具支持租户合并或拆分

### Requirement 7: 多租户性能优化

**User Story:** As a 系统架构师, I want 优化多租户系统性能, so that 系统能够支持大量租户同时使用。

#### Acceptance Criteria

1. THE System SHALL 使用数据库索引优化租户相关查询（tenantId 复合索引）
2. THE System SHALL 实现租户级别的缓存隔离
3. WHEN 查询涉及大量数据时, THE System SHALL 支持分页和游标分页
4. THE System SHALL 支持租户级别的连接池管理（可选的数据库隔离模式）
5. THE System SHALL 实现租户级别的限流以防止单租户影响整体性能
6. THE System SHALL 提供租户性能监控指标

### Requirement 8: 类型安全与代码质量

**User Story:** As a 开发者, I want 代码具有完善的类型安全, so that 我可以在编译时发现潜在问题。

#### Acceptance Criteria

1. THE System SHALL 消除所有 any 类型，使用明确的类型定义
2. THE System SHALL 使用 Prisma 泛型类型参数提升 Repository 层类型安全
3. THE System SHALL 使用枚举替代魔法字符串（status、delFlag 等）
4. THE System SHALL 统一使用 Logger 替代 console.log
5. THE System SHALL 为所有公共 API 提供完整的 TypeScript 类型定义
6. THE System SHALL 通过 ESLint 规则强制执行代码规范

### Requirement 9: 测试与质量保证

**User Story:** As a 开发者, I want 完善的测试覆盖, so that 我可以确保多租户功能的正确性。

#### Acceptance Criteria

1. THE System SHALL 为租户隔离逻辑提供单元测试，覆盖率达到 80% 以上
2. THE System SHALL 提供集成测试验证跨租户隔离的正确性
3. THE System SHALL 提供 E2E 测试验证完整的租户操作流程
4. WHEN 运行测试时, THE System SHALL 使用独立的测试租户避免数据污染
5. THE System SHALL 提供性能测试验证多租户场景下的系统性能
6. THE System SHALL 在 CI/CD 流程中自动执行测试

### Requirement 10: 代码精简与冗余清理

**User Story:** As a 开发者, I want 删除项目中不必要的代码和逻辑, so that 代码库更加精简、易于维护。

#### Acceptance Criteria

1. THE System SHALL 删除所有标记为 @deprecated 的文件和代码
2. THE System SHALL 删除示例代码文件（如 config-example.service.ts）
3. THE System SHALL 合并重复的目录结构（如 interceptor/ 与 interceptors/）
4. THE System SHALL 删除未使用的导出和死代码
5. THE System SHALL 移除冗余的向后兼容层（如 tenant/extensions/）
6. WHEN 存在功能重复的服务时, THE System SHALL 合并为单一实现
7. THE System SHALL 清理所有 console.log 调用，统一使用 Logger
8. THE System SHALL 删除空文件和仅包含注释的文件
9. THE System SHALL 移除未使用的依赖包
10. THE System SHALL 简化过度设计的抽象层

