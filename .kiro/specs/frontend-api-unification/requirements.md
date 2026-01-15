# Requirements Document

## Introduction

本规范定义了前端手写 API 接口的清理和统一工作。目标是将前端项目中手写的 API 接口进行分析，删除未使用的接口，对于正在使用但后端缺失的接口，在后端补全功能后使用生成的 API 进行对接。

## Glossary

- **Frontend**: admin-naive-ui 前端项目，基于 Vue3 + Naive UI
- **Backend**: server 后端项目，基于 NestJS + Prisma
- **Hand_Written_API**: 位于 `admin-naive-ui/src/service/api/` 目录下的手写 API 接口
- **Generated_API**: 位于 `admin-naive-ui/src/service/api-gen/` 目录下由 OpenAPI 生成的 API 接口
- **API_Unification_System**: 负责分析、清理和统一 API 接口的系统

## Requirements

### Requirement 1: 分析手写 API 使用情况

**User Story:** As a developer, I want to analyze which hand-written APIs are actually being used in the frontend, so that I can identify unused APIs for removal.

#### Acceptance Criteria

1. THE API_Unification_System SHALL scan all Vue components and TypeScript files to identify API usage
2. THE API_Unification_System SHALL generate a report listing each hand-written API and its usage status
3. WHEN an API is not imported or called anywhere, THE API_Unification_System SHALL mark it as unused

### Requirement 2: 删除未使用的手写 API

**User Story:** As a developer, I want to remove unused hand-written APIs, so that the codebase remains clean and maintainable.

#### Acceptance Criteria

1. WHEN an API is identified as unused, THE API_Unification_System SHALL remove it from the codebase
2. THE API_Unification_System SHALL update the index.ts export files after removal
3. THE API_Unification_System SHALL NOT remove APIs that are used in any component or service

### Requirement 3: 识别后端缺失的 API

**User Story:** As a developer, I want to identify which hand-written APIs are being used but have no corresponding backend implementation, so that I can prioritize backend development.

#### Acceptance Criteria

1. THE API_Unification_System SHALL compare hand-written API endpoints with backend controller routes
2. WHEN a hand-written API endpoint has no backend implementation, THE API_Unification_System SHALL flag it for backend development
3. THE API_Unification_System SHALL generate a list of missing backend APIs with their expected functionality

### Requirement 4: 后端 API 补全

**User Story:** As a developer, I want to implement missing backend APIs, so that the frontend can use generated APIs instead of hand-written ones.

#### Acceptance Criteria

1. WHEN a missing backend API is identified, THE Backend SHALL implement the corresponding controller and service
2. THE Backend SHALL follow existing code patterns and conventions
3. THE Backend SHALL include proper DTO validation and Swagger documentation
4. THE Backend SHALL regenerate the OpenAPI specification after implementation

### Requirement 5: 前端 API 迁移

**User Story:** As a developer, I want to migrate frontend code from hand-written APIs to generated APIs, so that the codebase is consistent and maintainable.

#### Acceptance Criteria

1. WHEN a backend API is implemented and generated API is available, THE Frontend SHALL replace hand-written API calls with generated API calls
2. THE Frontend SHALL update all import statements to use the generated API
3. THE Frontend SHALL verify that the migrated functionality works correctly
4. THE Frontend SHALL remove the hand-written API after successful migration

### Requirement 6: 保留特殊 API

**User Story:** As a developer, I want to keep hand-written APIs that require special handling (like FormData uploads), so that functionality is not broken.

#### Acceptance Criteria

1. WHEN an API requires FormData or special request handling, THE API_Unification_System SHALL mark it for retention
2. THE API_Unification_System SHALL document the reason for retention
3. THE Frontend SHALL continue using hand-written APIs for special cases until generated APIs support them

## Analysis Results

### 手写 API 使用情况分析

#### 正在使用的 API（需要保留或迁移）

| API 函数 | 文件位置 | 使用位置 | 后端状态 | 处理方式 |
|---------|---------|---------|---------|---------|
| fetchUploadFile | system/file-manager.ts | file-upload-modal.vue, index.vue | 已有 | 保留（FormData） |
| fetchBatchDeleteFiles | system/file-manager.ts | index.vue | 已有 | 迁移到生成 API |
| fetchGetDeptTree | system/user.ts | dept-tree.vue | 已有 | 迁移到生成 API |
| fetchUpdateUserAvatar | system/user.ts | user-avatar.vue | 已有 | 保留（FormData） |
| fetchSocialAuthBinding | system/social.ts | pwd-login.vue, social-card.vue | 已有 | 迁移到生成 API |
| fetchSocialAuthUnbinding | system/social.ts | social-card.vue | 已有 | 迁移到生成 API |
| fetchSocialList | system/social.ts | social-card.vue | 已有 | 迁移到生成 API |
| fetchGetClientList | system/client.ts | client/index.vue | 缺失 | 后端补全 |
| fetchCreateClient | system/client.ts | client-operate-drawer.vue | 缺失 | 后端补全 |
| fetchUpdateClient | system/client.ts | client-operate-drawer.vue | 缺失 | 后端补全 |
| fetchUpdateClientStatus | system/client.ts | client/index.vue | 缺失 | 后端补全 |
| fetchBatchDeleteClient | system/client.ts | client/index.vue | 缺失 | 后端补全 |
| fetchGetOssConfigList | system/oss-config.ts | oss-config/index.vue | 缺失 | 后端补全 |
| fetchCreateOssConfig | system/oss-config.ts | oss-config-operate-drawer.vue | 缺失 | 后端补全 |
| fetchUpdateOssConfig | system/oss-config.ts | oss-config-operate-drawer.vue | 缺失 | 后端补全 |
| fetchUpdateOssConfigStatus | system/oss-config.ts | oss-config/index.vue | 缺失 | 后端补全 |
| fetchBatchDeleteOssConfig | system/oss-config.ts | oss-config/index.vue | 缺失 | 后端补全 |
| fetchUpdateTenantPackageStatus | system/tenant-package.ts | tenant-package/index.vue | 已有 | 迁移到生成 API |
| fetchGetTenantSelectList | system/tenant.ts | tenant-switch/index.vue | 已有 | 迁移到生成 API |
| fetchSwitchTenant | system/tenant.ts | tenant-switch/index.vue | 已有 | 迁移到生成 API |
| fetchChangeTenant | system/tenant.ts | tenant-select.vue | 已有 | 迁移到生成 API |
| fetchClearTenant | system/tenant.ts | tenant-select.vue | 已有 | 迁移到生成 API |
| fetchRestoreTenant | system/tenant.ts | tenant-switch/index.vue | 已有 | 迁移到生成 API |
| fetchGetTenantSwitchStatus | system/tenant.ts | tenant-switch/index.vue | 已有 | 迁移到生成 API |
| fetchGetTenantQuotaList | system/tenant.ts | tenant-quota/index.vue | 已有 | 迁移到生成 API |
| fetchGetTenantQuotaDetail | system/tenant.ts | quota-edit-drawer.vue | 已有 | 迁移到生成 API |
| fetchUpdateTenantQuota | system/tenant.ts | quota-edit-drawer.vue | 已有 | 迁移到生成 API |
| fetchGetTenantAuditLogList | system/tenant.ts | tenant-audit/index.vue | 已有 | 迁移到生成 API |
| fetchGetTenantAuditLogDetail | system/tenant.ts | audit-detail-modal.vue | 已有 | 迁移到生成 API |
| fetchExportTenantAuditLog | system/tenant.ts | tenant-audit/index.vue | 已有 | 迁移到生成 API |
| fetchGetDashboardData | system/tenant.ts | tenant-dashboard/index.vue | 已有 | 迁移到生成 API |
| fetchGetOssList | system/oss.ts | oss/index.vue | 缺失 | 后端补全 |
| fetchGetOssListByIds | system/oss.ts | oss-upload.vue | 缺失 | 后端补全 |
| fetchBatchDeleteOss | system/oss.ts | oss/index.vue, file-upload.vue, umo-doc-editor.vue | 缺失 | 后端补全 |
| fetchUploadFile (oss) | system/oss.ts | umo-doc-editor.vue | 缺失 | 后端补全 |
| fetchGetConfigByKey | system/config.ts | oss/index.vue | 已有 | 迁移到生成 API |
| fetchUpdateConfigByKey | system/config.ts | oss/index.vue | 已有 | 迁移到生成 API |
| fetchGetNotifyList | system/notify.ts | notify-bell/index.vue | 已有 | 迁移到生成 API |
| fetchGetRecentMessages | system/notify.ts | notify-bell/index.vue | 已有 | 迁移到生成 API |
| fetchGetUnreadCount | system/notify.ts | notify-bell/index.vue | 已有 | 迁移到生成 API |
| fetchMarkAsRead | system/notify.ts | notify-bell/index.vue | 已有 | 迁移到生成 API |
| fetchMarkAllAsRead | system/notify.ts | notify-bell/index.vue | 已有 | 迁移到生成 API |
| fetchGetOnlineDeviceList | monitor/online.ts | online-table.vue | 已有 | 迁移到生成 API |
| fetchKickOutCurrentDevice | monitor/online.ts | online-table.vue | 已有 | 迁移到生成 API |
| fetchUpdateJob | monitor/job.ts | job-operate-drawer.vue | 已有 | 迁移到生成 API |
| fetchChangeJobStatus | monitor/job.ts | job/index.vue | 已有 | 迁移到生成 API |
| fetchRunJob | monitor/job.ts | job/index.vue | 已有 | 迁移到生成 API |
| fetchDeleteJobLog | monitor/job-log.ts | job-log/index.vue | 已有 | 迁移到生成 API |
| fetchGetGenTableList | tool/gen.ts | gen/index.vue | 缺失 | 后端补全 |
| fetchImportGenTable | tool/gen.ts | gen-table-import-drawer.vue | 缺失 | 后端补全 |
| fetchUpdateGenTable | tool/gen.ts | gen-table-operate-drawer.vue | 缺失 | 后端补全 |
| fetchGetGenTableInfo | tool/gen.ts | gen-table-operate-drawer.vue | 缺失 | 后端补全 |
| fetchBatchDeleteGenTable | tool/gen.ts | gen/index.vue | 缺失 | 后端补全 |
| fetchGetGenDataNames | tool/gen.ts | gen/index.vue, gen-table-import-drawer.vue | 缺失 | 后端补全 |
| fetchGetGenDbList | tool/gen.ts | gen-table-import-drawer.vue | 缺失 | 后端补全 |
| fetchSynchGenDbList | tool/gen.ts | gen/index.vue | 缺失 | 后端补全 |
| fetchGetGenPreview | tool/gen.ts | gen-table-preview-drawer.vue | 缺失 | 后端补全 |
| fetchGenCode | tool/gen.ts | gen/index.vue | 缺失 | 后端补全 |

#### 未使用的 API（可删除）

| API 函数 | 文件位置 | 原因 |
|---------|---------|------|
| fetchGetOnlineUserList | monitor/online.ts | 未在任何组件中使用 |
| fetchForceLogout | monitor/online.ts | 未在任何组件中使用 |
| fetchBatchGenCode | tool/gen.ts | 未在任何组件中使用 |
| fetchGetFolderList | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetFolderTree | system/file-manager.ts | 使用生成 API 替代 |
| fetchCreateFolder | system/file-manager.ts | 使用生成 API 替代 |
| fetchUpdateFolder | system/file-manager.ts | 使用生成 API 替代 |
| fetchDeleteFolder | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetFileList | system/file-manager.ts | 使用生成 API 替代 |
| fetchMoveFiles | system/file-manager.ts | 使用生成 API 替代 |
| fetchRenameFile | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetFileDetail | system/file-manager.ts | 使用生成 API 替代 |
| fetchCreateShare | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetShare | system/file-manager.ts | 使用生成 API 替代 |
| fetchCancelShare | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetMyShares | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetRecycleList | system/file-manager.ts | 使用生成 API 替代 |
| fetchRestoreFiles | system/file-manager.ts | 使用生成 API 替代 |
| fetchClearRecycle | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetFileVersions | system/file-manager.ts | 使用生成 API 替代 |
| fetchRestoreVersion | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetFileAccessToken | system/file-manager.ts | 使用生成 API 替代 |
| downloadFile | system/file-manager.ts | 使用生成 API 替代 |
| downloadBatchFiles | system/file-manager.ts | 使用生成 API 替代 |
| fetchGetStorageStats | system/file-manager.ts | 使用生成 API 替代 |

### 后端缺失 API 清单

需要在后端补全的模块：

1. **客户端管理模块** (`/system/client`)
   - GET /system/client/list - 获取客户端列表
   - POST /system/client - 新增客户端
   - PUT /system/client - 修改客户端
   - PUT /system/client/changeStatus - 修改客户端状态
   - DELETE /system/client/:ids - 批量删除客户端

2. **OSS 配置管理模块** (`/resource/oss/config`)
   - GET /resource/oss/config/list - 获取 OSS 配置列表
   - POST /resource/oss/config - 新增 OSS 配置
   - PUT /resource/oss/config - 修改 OSS 配置
   - PUT /resource/oss/config/changeStatus - 修改 OSS 配置状态
   - DELETE /resource/oss/config/:ids - 批量删除 OSS 配置

3. **OSS 文件管理模块** (`/resource/oss`)
   - GET /resource/oss/list - 获取 OSS 文件列表
   - GET /resource/oss/listByIds/:ids - 根据 ID 列表获取 OSS 文件
   - DELETE /resource/oss/:ids - 批量删除 OSS 文件
   - POST /resource/oss/upload - 上传文件

4. **代码生成工具模块** (`/tool/gen`)
   - GET /tool/gen/list - 查询代码生成列表
   - POST /tool/gen/importTable - 导入表结构
   - PUT /tool/gen - 修改代码生成
   - GET /tool/gen/:id - 获取代码生成信息
   - DELETE /tool/gen/:ids - 批量删除代码生成
   - GET /tool/gen/getDataNames - 查询数据源名称列表
   - GET /tool/gen/db/list - 查询数据库列表
   - GET /tool/gen/synchDb/:id - 同步数据库
   - GET /tool/gen/preview/:id - 预览代码
   - GET /tool/gen/genCode/:id - 生成代码
