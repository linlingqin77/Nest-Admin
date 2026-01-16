# Implementation Plan: Enterprise Code Generator

## Overview

本实现计划将企业级代码生成器功能分解为可执行的开发任务。实现采用增量开发方式，每个任务都建立在前一个任务的基础上，确保代码可以逐步集成和测试。

## Tasks

- [x] 1. 数据库模型扩展
  - [x] 1.1 创建 Prisma 模型扩展
    - 在 schema.prisma 中添加 GenDataSource、GenTemplateGroup、GenTemplate、GenHistory 模型
    - 扩展 GenTable 模型添加 tenantId、dataSourceId、templateGroupId 字段
    - 运行 prisma migrate 生成迁移文件
    - _Requirements: 1.1, 9.1, 12.1_

  - [x] 1.2 创建种子数据
    - 创建默认模板组和模板的种子数据
    - 包含 NestJS 和 Vue3 的默认模板
    - _Requirements: 6.1_

- [x] 2. 数据源管理模块
  - [x] 2.1 实现数据源 DTO
    - 创建 CreateDataSourceDto、UpdateDataSourceDto、QueryDataSourceDto
    - 添加 class-validator 验证装饰器
    - 添加 Swagger 文档装饰器
    - _Requirements: 1.1, 1.2, 15.4, 15.5_

  - [x] 2.2 实现数据源服务
    - 实现 create、update、delete、findAll、findOne 方法
    - 实现密码加密存储（使用 node-forge AES 加密）
    - 实现 testConnection 方法测试数据库连接
    - 实现 getTables 和 getColumns 方法获取数据库元数据
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.3 编写数据源服务属性测试
    - **Property 1: 数据源密码加密往返**
    - **Validates: Requirements 1.6**

  - [x] 2.4 实现数据源控制器
    - 创建 RESTful API 端点
    - 添加权限控制装饰器
    - 添加 Swagger 文档
    - _Requirements: 11.1, 15.1, 15.2, 15.3_

- [x] 3. Checkpoint - 数据源管理完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 字段推断引擎
  - [x] 4.1 实现字段推断服务
    - 创建 FieldInferenceService
    - 实现默认推断规则（status、type、time、image、file、content、name）
    - 实现主键和自增字段处理
    - 实现 NOT NULL 约束推断
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 4.2 编写字段推断属性测试
    - **Property 3: 字段推断规则一致性**
    - **Property 4: 主键字段排除**
    - **Property 5: NOT NULL 约束推断**
    - **Validates: Requirements 3.1-3.9**

- [x] 5. 表配置管理模块
  - [x] 5.1 扩展表配置 DTO
    - 更新 GenTableDto 添加新字段
    - 添加命名规范验证（PascalCase、kebab-case）
    - 添加树形表和子表配置验证
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 5.2 编写命名规范属性测试
    - **Property 6: 命名规范验证**
    - **Validates: Requirements 4.5, 4.6**

  - [x] 5.3 扩展表配置服务
    - 更新 importTable 方法集成字段推断
    - 更新 syncTable 方法保留用户自定义配置
    - 添加租户隔离查询
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 12.2, 12.6_

  - [x] 5.4 编写租户隔离属性测试
    - **Property 2: 租户数据隔离** ✅ (3/3 tests passed)
    - **Property 14: 表同步保留自定义配置** ✅ (5/5 tests passed)
    - **Validates: Requirements 2.5, 12.2, 12.6**

- [x] 6. Checkpoint - 表配置管理完成
  - ✅ 所有 47 个测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 7. 模板管理模块
  - [x] 7.1 实现模板 DTO
    - 创建 CreateTemplateGroupDto、UpdateTemplateDto、QueryTemplateDto
    - 添加验证和 Swagger 文档
    - _Requirements: 6.2, 15.4, 15.5_

  - [x] 7.2 实现模板服务
    - 实现模板组 CRUD 操作
    - 实现模板渲染方法（变量替换）
    - 实现模板语法验证
    - 实现模板导入导出（JSON 格式）
    - _Requirements: 6.2, 6.4, 6.5, 6.6_

  - [x] 7.3 编写模板服务属性测试
    - **Property 7: 模板变量替换完整性**
    - **Property 8: 模板组导入导出往返**
    - **Validates: Requirements 6.4, 6.6**

  - [x] 7.4 实现模板控制器
    - 创建 RESTful API 端点
    - 添加权限控制和 Swagger 文档
    - _Requirements: 11.1, 11.4, 15.1, 15.2_

- [x] 8. 代码生成核心模块
  - [x] 8.1 更新 NestJS 模板 ✅
    - 更新 controller 模板添加完整 Swagger 装饰器
    - 更新 service 模板使用 Result 类和 PrismaService
    - 更新 dto 模板添加 @ApiProperty/@ApiPropertyOptional 装饰器
    - 更新 module 模板
    - 更新 entity 模板
    - 添加多租户支持（tenantId 字段处理）
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.11, 15.1-15.10_

  - [x] 8.2 编写 NestJS 代码生成属性测试 ✅ (22/22 tests passed)
    - **Property 9: 生成代码包含必要装饰器**
    - **Property 10: 生成代码使用统一响应格式**
    - **Validates: Requirements 13.3, 13.4, 15.1, 15.10**

  - [x] 8.3 更新 Vue3 模板 ✅
    - 更新 index.vue 模板使用 Naive UI 组件 (NDataTable, NButton, etc.)
    - 更新 dialog.vue 模板使用 NDrawer, NForm
    - 更新 api.ts 模板使用 fetchXxx 命名
    - 创建 search.vue 模板用于搜索组件
    - 添加 TypeScript 类型定义
    - _Requirements: 13.7, 13.8, 13.9, 13.10, 13.12_

  - [x] 8.4 实现 SQL 生成模板 ✅
    - 创建菜单 SQL 生成模板 (menu.sql.ts)
    - 创建权限 SQL 生成模板 (permission.sql.ts)
    - _Requirements: 13.13, 13.14_

  - [x] 8.5 实现代码格式化工具 ✅
    - 实现单引号、2空格缩进、尾随逗号、分号格式化 (code-formatter.ts)
    - 实现文件名命名转换（kebab-case、PascalCase、camelCase、snake_case）(naming-converter.ts)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_

  - [x] 8.6 编写代码风格属性测试 ✅ (16/16 tests passed)
    - **Property 11: 生成代码遵循代码风格**
    - **Validates: Requirements 14.1-14.4**

- [x] 9. Checkpoint - 代码生成核心完成
  - ⚠️ 5 个测试失败，61 个测试通过
  - 失败原因：DTO 模板文件是旧版本，需要更新
  - 确保所有测试通过，如有问题请询问用户
  - 所有测试通过

- [x] 10. 代码预览与下载模块
  - [x] 10.1 实现预览服务
    - 更新 preview 方法返回完整文件信息（大小、行数）
    - 实现文件树结构组织
    - _Requirements: 7.1, 7.6_

  - [x] 10.2 实现代码生成与打包
    - 更新 batchGenCode 方法支持多表批量生成
    - 实现 ZIP 文件创建（UTF-8 编码）
    - 实现文件命名规范（{projectName}_{timestamp}.zip）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 10.3 编写 ZIP 生成属性测试
    - **Property 13: ZIP 文件结构正确性**
    - **Validates: Requirements 8.2, 8.4**

- [x] 11. 历史版本管理模块
  - [x] 11.1 实现历史服务
    - 实现 record 方法记录生成历史
    - 实现 getHistory 方法获取历史列表
    - 实现 getHistoryDetail 方法获取历史详情
    - 实现 cleanupOldHistory 方法清理过期记录
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 11.2 编写历史管理属性测试
    - **Property 12: 生成历史数量限制**
    - **Validates: Requirements 9.2**

  - [x] 11.3 实现历史控制器
    - 创建历史查询和下载 API
    - 添加权限控制
    - _Requirements: 9.3, 11.1_

- [x] 12. Checkpoint - 后端功能完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 13. 前端数据源管理页面
  - [x] 13.1 创建数据源管理页面
    - 创建 views/tool/gen/datasource/index.vue
    - 实现数据源列表展示
    - 实现新增、编辑、删除数据源
    - 实现连接测试功能
    - _Requirements: 1.1, 1.2, 1.5, 10.1_

  - [x] 13.2 创建数据源 API 服务
    - 在 service/api-gen 中添加数据源相关 API
    - _Requirements: 13.9_

- [x] 14. 前端表配置页面优化
  - [x] 14.1 优化表导入弹窗
    - 添加数据源选择
    - 添加表预览功能
    - _Requirements: 2.1, 2.2, 10.5_

  - [x] 14.2 优化表配置表单
    - 添加基本信息、字段配置、生成配置三个 Tab
    - 实现字段拖拽排序
    - 实现实时验证反馈
    - _Requirements: 5.6, 10.2, 10.3_

  - [x] 14.3 优化代码预览弹窗
    - 实现文件树结构展示
    - 实现语法高亮
    - 实现复制到剪贴板
    - 显示文件大小和行数
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 15. 前端模板管理页面
  - [x] 15.1 创建模板管理页面
    - 创建 views/tool/gen/template/index.vue
    - 实现模板组列表展示
    - 实现模板编辑器（Monaco Editor）
    - 实现模板导入导出
    - _Requirements: 6.2, 6.3, 6.6, 10.1_

  - [x] 15.2 创建模板 API 服务
    - 在 service/api-gen 中添加模板相关 API
    - _Requirements: 13.9_

- [x] 16. 前端历史版本页面
  - [x] 16.1 创建历史版本页面
    - 创建 views/tool/gen/history/index.vue
    - 实现历史列表展示
    - 实现版本下载
    - _Requirements: 9.3, 10.1_

  - [x] 16.2 创建历史 API 服务
    - 在 service/api-gen 中添加历史相关 API
    - _Requirements: 13.9_

- [x] 17. 路由和菜单配置
  - [x] 17.1 添加前端路由
    - 在 router 中添加数据源、模板、历史页面路由
    - _Requirements: 10.1_

  - [x] 17.2 添加菜单和权限
    - 在数据库中添加菜单记录
    - 添加权限配置
    - _Requirements: 11.1, 11.2_

- [x] 18. Checkpoint - 前端功能完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 19. 性能优化与安全加固
  - [x] 19.1 实现请求限流
    - 添加代码生成接口的限流配置
    - _Requirements: 16.5_

  - [x] 19.2 实现操作日志
    - 添加代码生成操作的审计日志
    - _Requirements: 11.3_

  - [x] 19.3 编写性能测试
    - 测试单表生成时间 < 2秒
    - 测试 10 表批量生成时间 < 10秒
    - 测试 100 列表处理性能
    - _Requirements: 16.1, 16.2, 16.3_

- [x] 20. Final Checkpoint - 全部功能完成
  - 确保所有测试通过
  - 运行 ESLint 检查
  - 验证生成的代码可以直接使用
  - 如有问题请询问用户

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- 生成的代码需要与现有项目无缝集成，遵循项目编码规范
