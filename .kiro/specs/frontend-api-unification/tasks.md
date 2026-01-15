# Implementation Plan: Frontend API Unification

## Overview

本实现计划将前端手写 API 接口进行清理和统一，删除未使用的接口，补全后端缺失的功能，并将前端代码迁移到使用生成的 API。

## Tasks

- [x] 1. 清理未使用的手写 API
  - [x] 1.1 删除 monitor/online.ts 中未使用的函数
    - 删除 `fetchGetOnlineUserList` 和 `fetchForceLogout` 函数
    - 这些函数未在任何组件中使用
    - _Requirements: 2.1, 2.2_

  - [x] 1.2 删除 tool/gen.ts 中未使用的函数
    - 删除 `fetchBatchGenCode` 函数
    - 该函数未在任何组件中使用
    - _Requirements: 2.1, 2.2_

  - [x] 1.3 清理 file-manager.ts 中未使用的函数
    - 删除已有生成 API 替代的函数（约 20 个）
    - 保留 `fetchUploadFile` 和 `fetchBatchDeleteFiles`
    - _Requirements: 2.1, 2.2, 6.1_

  - [x] 1.4 更新 index.ts 导出文件
    - 更新 `api/index.ts`
    - 更新 `api/system/index.ts`
    - 更新 `api/monitor/index.ts`
    - 更新 `api/tool/index.ts`
    - _Requirements: 2.2_

- [x] 2. Checkpoint - 验证清理结果
  - 确保前端项目编译通过
  - 确保所有页面功能正常
  - 如有问题请告知

- [x] 3. 后端补全 - 客户端管理模块
  - [x] 3.1 创建客户端管理 DTO
    - 创建 `CreateClientDto`, `UpdateClientDto`, `ListClientDto`
    - 创建 `ClientResponseDto`
    - 添加验证装饰器和 Swagger 文档
    - _Requirements: 4.1, 4.3_

  - [x] 3.2 创建客户端管理 Service
    - 实现 `findAll`, `create`, `update`, `changeStatus`, `remove` 方法
    - 使用 Prisma 进行数据库操作
    - _Requirements: 4.1, 4.2_

  - [x] 3.3 创建客户端管理 Controller
    - 实现 GET `/system/client/list`
    - 实现 POST `/system/client`
    - 实现 PUT `/system/client`
    - 实现 PUT `/system/client/changeStatus`
    - 实现 DELETE `/system/client/:ids`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 3.4 编写客户端管理单元测试
    - 测试 Service 方法
    - 测试 Controller 路由
    - _Requirements: 4.1_

- [x] 4. 后端补全 - OSS 配置管理模块
  - [x] 4.1 创建 OSS 配置管理 DTO
    - 创建 `CreateOssConfigDto`, `UpdateOssConfigDto`, `ListOssConfigDto`
    - 创建 `OssConfigResponseDto`
    - 添加验证装饰器和 Swagger 文档
    - _Requirements: 4.1, 4.3_

  - [x] 4.2 创建 OSS 配置管理 Service
    - 实现 `findAll`, `create`, `update`, `changeStatus`, `remove` 方法
    - 使用 Prisma 进行数据库操作
    - _Requirements: 4.1, 4.2_

  - [x] 4.3 创建 OSS 配置管理 Controller
    - 实现 GET `/resource/oss/config/list`
    - 实现 POST `/resource/oss/config`
    - 实现 PUT `/resource/oss/config`
    - 实现 PUT `/resource/oss/config/changeStatus`
    - 实现 DELETE `/resource/oss/config/:ids`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 4.4 编写 OSS 配置管理单元测试
    - 测试 Service 方法
    - 测试 Controller 路由
    - _Requirements: 4.1_

- [x] 5. 后端补全 - OSS 文件管理模块
  - [x] 5.1 创建 OSS 文件管理 DTO
    - 创建 `ListOssDto`
    - 创建 `OssResponseDto`
    - 添加验证装饰器和 Swagger 文档
    - _Requirements: 4.1, 4.3_

  - [x] 5.2 创建 OSS 文件管理 Service
    - 实现 `findAll`, `findByIds`, `upload`, `remove` 方法
    - 集成现有的上传服务
    - _Requirements: 4.1, 4.2_

  - [x] 5.3 创建 OSS 文件管理 Controller
    - 实现 GET `/resource/oss/list`
    - 实现 GET `/resource/oss/listByIds/:ids`
    - 实现 POST `/resource/oss/upload`
    - 实现 DELETE `/resource/oss/:ids`
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 5.4 编写 OSS 文件管理单元测试
    - 测试 Service 方法
    - 测试 Controller 路由
    - _Requirements: 4.1_

- [x] 6. Checkpoint - 验证后端 API
  - 确保后端项目编译通过
  - 确保所有新增 API 可以正常访问
  - 如有问题请告知

- [x] 7. 重新生成前端 API
  - [x] 7.1 更新 OpenAPI 规范
    - 运行后端项目生成最新的 openApi.json
    - _Requirements: 4.4_

  - [x] 7.2 重新生成前端 API 代码
    - 运行 `pnpm gen:api` 生成新的 API 代码
    - 验证新生成的 API 文件
    - _Requirements: 4.4_

- [x] 8. 前端 API 迁移 - 代码生成工具
  > **注意**: 前端 API 迁移需要额外的类型调整工作，因为生成的 API 类型与手写的前端类型定义存在差异。
  > 建议在迁移前先统一前端类型定义，或者在迁移时添加类型转换。
  
  - [x] 8.1 迁移 gen/index.vue
    - 替换 `fetchGetGenTableList` 为 `fetchToolFindAll`
    - 替换 `fetchBatchDeleteGenTable` 为 `fetchToolRemove`
    - 替换 `fetchSynchGenDbList` 为 `fetchToolSynchDb`
    - 替换 `fetchGenCode` 为 `fetchToolBatchGenCode`
    - 替换 `fetchGetGenDataNames` 为 `fetchToolGetDataNames`
    - _Requirements: 5.1, 5.2_

  - [x] 8.2 迁移 gen-table-import-drawer.vue
    - 替换 `fetchGetGenDataNames` 为 `fetchToolGetDataNames`
    - 替换 `fetchGetGenDbList` 为 `fetchToolGenDbList`
    - 替换 `fetchImportGenTable` 为 `fetchToolGenImportTable`
    - _Requirements: 5.1, 5.2_

  - [x] 8.3 迁移 gen-table-operate-drawer.vue
    - 替换 `fetchGetGenTableInfo` 为 `fetchToolGen`
    - 替换 `fetchUpdateGenTable` 为 `fetchToolGenUpdate`
    - _Requirements: 5.1, 5.2_

  - [x] 8.4 迁移 gen-table-preview-drawer.vue
    - 替换 `fetchGetGenPreview` 为 `fetchToolPreview`
    - _Requirements: 5.1, 5.2_

- [x] 9. 前端 API 迁移 - 客户端管理
  - [x] 9.1 迁移 client/index.vue
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

  - [x] 9.2 迁移 client-operate-drawer.vue
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

- [x] 10. 前端 API 迁移 - OSS 配置管理
  - [x] 10.1 迁移 oss-config/index.vue
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

  - [x] 10.2 迁移 oss-config-operate-drawer.vue
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

- [x] 11. 前端 API 迁移 - OSS 文件管理
  - [x] 11.1 迁移 oss/index.vue
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 迁移 oss-upload.vue 组件
    - 该组件不直接使用 OSS API，使用 file-upload 组件
    - _Requirements: 5.1, 5.2_

  - [x] 11.3 迁移 file-upload.vue 组件
    - 替换为生成的 API 调用
    - 更新导入语句
    - _Requirements: 5.1, 5.2_

  - [x] 11.4 迁移 umo-doc-editor.vue 组件
    - 替换删除 API 为生成的 API 调用
    - 保留 fetchUploadFile（需要 FormData）
    - _Requirements: 5.1, 5.2_

- [x] 12. Checkpoint - 验证 OSS 相关迁移
  - 确保前端项目编译通过
  - 确保 OSS 相关页面功能正常
  - 如有问题请告知

- [x] 13. 清理已迁移的手写 API
  - [x] 13.1 删除 tool/gen.ts 文件
    - 所有函数已迁移到生成 API
    - _Requirements: 5.4_

  - [x] 13.2 删除 system/client.ts 文件
    - 所有函数已迁移到生成 API
    - _Requirements: 5.4_

  - [x] 13.3 删除 system/oss-config.ts 文件
    - 所有函数已迁移到生成 API
    - _Requirements: 5.4_

  - [x] 13.4 清理 system/oss.ts 文件
    - 保留 fetchUploadFile（需要 FormData）
    - 删除其他已迁移的函数
    - _Requirements: 5.4_

  - [x] 13.5 更新 index.ts 导出文件
    - 移除已删除文件的导出
    - 更新 tool/index.ts
    - 更新 system/index.ts
    - _Requirements: 5.4_

- [x] 14. Final Checkpoint - 验证最终结果
  - 确保前端项目编译通过
  - 确保所有页面功能正常
  - 确保没有遗留的手写 API 引用
  - 如有问题请告知

## Notes

- 任务标记 `*` 的为可选任务，可以跳过以加快 MVP 进度
- 每个任务都引用了具体的需求以便追溯
- Checkpoint 任务用于确保增量验证
- 保留需要 FormData 的 API（如 `fetchUploadFile`, `fetchUpdateUserAvatar`）
- 迁移过程中注意类型兼容性
