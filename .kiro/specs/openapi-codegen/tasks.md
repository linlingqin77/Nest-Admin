# Implementation Plan: OpenAPI 代码生成

## Overview

本实现计划将 OpenAPI 代码生成功能分解为可执行的任务，按照依赖关系排序，确保每个任务都能独立验证。

## Tasks

- [x] 1. 安装依赖并配置基础环境
  - 安装 `@hey-api/openapi-ts` 代码生成工具
  - 在 `package.json` 中添加 `gen:api` 脚本命令
  - _Requirements: 1.2, 8.1_

- [x] 2. 创建代码生成配置文件
  - [x] 2.1 创建 `openapi-ts.config.ts` 配置文件
    - 配置输入源为 `../server/public/openApi.json`
    - 配置输出目录为 `src/service/api-gen`
    - 配置类型输出目录为 `src/typings/api-gen`
    - _Requirements: 2.1, 2.3, 8.3_

- [x] 3. 创建请求适配器
  - [x] 3.1 创建 `src/service/api-gen/request-adapter.ts`
    - 实现 `apiRequest<T>()` 函数，将生成的请求配置转换为项目 request 格式
    - 导入并使用项目现有的 `request` 实例
    - _Requirements: 1.4, 3.1_

- [x] 4. 创建自定义配置文件
  - [x] 4.1 创建 `src/service/api-gen/api-config.ts`
    - 定义 `ApiCustomConfig` 接口
    - 创建 `apiCustomConfigs` 配置映射
    - 配置需要加密的 API（登录、注册、重置密码等）
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. 创建代码生成后处理脚本
  - [x] 5.1 创建 `scripts/post-gen-api.ts` 后处理脚本
    - 修改生成的文件，替换 client 导入为 request-adapter
    - 应用自定义配置到对应的 API 函数
    - 添加 `@generated` 注释标记
    - 生成 `index.ts` 统一导出文件
    - _Requirements: 2.4, 6.3, 3.2_

- [x] 6. 执行首次代码生成并验证
  - [x] 6.1 运行 `pnpm gen:api` 命令
    - 验证 API 文件生成到正确目录
    - 验证类型文件生成到正确目录
    - 验证 index.ts 导出文件生成
    - _Requirements: 1.1, 2.1, 2.3, 2.4_

- [x] 7. Checkpoint - 验证基础生成功能
  - 确保所有生成的文件存在且格式正确
  - 确保 TypeScript 编译无错误
  - 如有问题请与用户确认

- [x] 8. 编写属性测试
  - [x] 8.1 编写 Schema 完整性属性测试
    - **Property 4: Schema 完整性**
    - **Validates: Requirements 4.1**
  
  - [x] 8.2 编写 API 代码格式属性测试
    - **Property 2: API 代码格式正确性**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [x] 8.3 编写自定义配置应用属性测试
    - **Property 5: 自定义配置正确应用**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 9. 优化类型生成
  - [x] 9.1 处理 Result<T> 响应类型解包
    - 修改类型生成逻辑，提取 `data` 字段类型
    - 确保 API 函数返回类型为解包后的业务数据类型
    - _Requirements: 7.1, 7.2_
    - **注**: 已在 `post-gen-api.ts` 中实现，通过解析 `allOf` 中的 `data` 属性获取实际类型
  
  - [x] 9.2 处理分页响应类型
    - 识别分页响应结构
    - 生成正确的 `PageResult<T>` 类型
    - _Requirements: 7.3_
    - **注**: 后端已定义独立的分页响应类型（如 `UserListResponseDto`），直接使用

- [x] 10. 添加文档和使用说明
  - [x] 10.1 在生成目录添加 README.md
    - 说明该目录为自动生成
    - 说明如何重新生成
    - 说明如何添加自定义配置
    - _Requirements: 6.3_

- [x] 11. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 确保生成的 API 可以正常调用
  - 如有问题请与用户确认

## Notes

- 所有任务都是必须执行的，包括属性测试
- 每个任务都引用了具体的需求条款以便追溯
- Checkpoint 任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证通用正确性属性，单元测试验证具体示例

