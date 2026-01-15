# Requirements Document

## Introduction

本功能旨在为前端项目引入基于 OpenAPI 规范的自动化 API 代码生成方案，替代现有的手写 API 调用代码方式。通过读取后端生成的 `openApi.json` 文件，自动生成类型安全的 API 调用函数和 TypeScript 类型定义，同时复用项目中已封装好的 `request` 实例。

## Glossary

- **OpenAPI_Spec**: OpenAPI 3.0 规范文件，由后端 NestJS 项目通过 Swagger 自动生成，位于 `server/public/openApi.json`
- **Code_Generator**: 代码生成工具，读取 OpenAPI 规范并生成 TypeScript API 调用代码和类型定义
- **Request_Instance**: 项目中已封装的 Axios 请求实例，位于 `admin-naive-ui/src/service/request/index.ts`
- **Generated_API**: 由 Code_Generator 自动生成的 API 调用函数
- **Generated_Types**: 由 Code_Generator 自动生成的 TypeScript 类型定义
- **Custom_Template**: 自定义代码生成模板，用于适配项目现有的代码风格和 request 封装

## Requirements

### Requirement 1: 代码生成工具集成

**User Story:** 作为开发者，我希望能够通过一条命令自动生成 API 代码，以便减少手写 API 调用代码的工作量并保持类型安全。

#### Acceptance Criteria

1. WHEN 开发者执行生成命令 THEN THE Code_Generator SHALL 读取 OpenAPI_Spec 文件并生成 Generated_API 和 Generated_Types
2. THE Code_Generator SHALL 支持通过 npm script 命令执行（如 `pnpm gen:api`）
3. WHEN OpenAPI_Spec 文件不存在或格式错误 THEN THE Code_Generator SHALL 输出明确的错误信息并终止执行
4. THE Generated_API SHALL 使用项目中已封装的 Request_Instance 进行 HTTP 请求

### Requirement 2: 生成代码的目录结构

**User Story:** 作为开发者，我希望生成的代码有清晰的目录结构，以便于管理和维护。

#### Acceptance Criteria

1. THE Code_Generator SHALL 将 Generated_API 输出到 `admin-naive-ui/src/service/api-gen/` 目录
2. THE Code_Generator SHALL 按照 OpenAPI tags 分组生成 API 文件（如 `auth.ts`、`system-user.ts`）
3. THE Code_Generator SHALL 将 Generated_Types 输出到 `admin-naive-ui/src/typings/api-gen/` 目录
4. THE Code_Generator SHALL 生成 `index.ts` 文件统一导出所有 Generated_API

### Requirement 3: 生成的 API 函数格式

**User Story:** 作为开发者，我希望生成的 API 函数与现有手写代码风格一致，以便于无缝集成和使用。

#### Acceptance Criteria

1. THE Generated_API SHALL 使用 `request<T>()` 泛型调用方式，与现有代码风格保持一致
2. THE Generated_API SHALL 包含 JSDoc 注释，包括接口描述、参数说明和返回值类型
3. WHEN API 需要请求体参数 THEN THE Generated_API SHALL 使用 `data` 参数传递
4. WHEN API 需要查询参数 THEN THE Generated_API SHALL 使用 `params` 参数传递
5. WHEN API 需要路径参数 THEN THE Generated_API SHALL 在 URL 中进行模板替换
6. THE Generated_API 函数名 SHALL 遵循 `fetch{OperationId}` 或 `{method}{ResourceName}` 的命名规范

### Requirement 4: 生成的类型定义格式

**User Story:** 作为开发者，我希望生成的类型定义完整且准确，以便获得完整的 TypeScript 类型检查支持。

#### Acceptance Criteria

1. THE Generated_Types SHALL 包含所有 OpenAPI_Spec 中定义的 schemas
2. THE Generated_Types SHALL 正确处理嵌套对象、数组、枚举等复杂类型
3. THE Generated_Types SHALL 正确处理可选字段（使用 `?` 标记）
4. THE Generated_Types SHALL 正确处理 nullable 字段
5. THE Generated_Types SHALL 使用 namespace 或 module 进行类型分组，避免全局命名冲突

### Requirement 5: 自定义请求配置支持

**User Story:** 作为开发者，我希望能够为特定 API 添加自定义请求配置（如加密、防重复提交），以便满足业务需求。

#### Acceptance Criteria

1. THE Code_Generator SHALL 支持通过配置文件定义特定 API 的自定义 headers
2. WHEN API 需要加密 THEN THE Generated_API SHALL 在 headers 中包含 `isEncrypt: 'true'`
3. WHEN API 需要防重复提交 THEN THE Generated_API SHALL 在 headers 中包含 `repeatSubmit: false`
4. WHEN API 不需要 token THEN THE Generated_API SHALL 在 headers 中包含 `isToken: false`

### Requirement 6: 增量更新与手动代码共存

**User Story:** 作为开发者，我希望生成的代码能够与现有手写代码共存，以便逐步迁移而不影响现有功能。

#### Acceptance Criteria

1. THE Code_Generator SHALL 将生成代码放在独立目录（`api-gen/`），不覆盖现有 `api/` 目录
2. THE Code_Generator SHALL 在每次执行时完全重新生成代码，确保与 OpenAPI_Spec 同步
3. THE Generated_API 目录 SHALL 包含 `.gitignore` 或注释标记，提示该目录为自动生成

### Requirement 7: 响应类型处理

**User Story:** 作为开发者，我希望生成的代码能正确处理项目的统一响应格式，以便直接获取业务数据。

#### Acceptance Criteria

1. THE Generated_Types SHALL 正确解析 `Result<T>` 包装类型，提取实际业务数据类型
2. THE Generated_API 返回类型 SHALL 为解包后的业务数据类型（与现有 `transformBackendResponse` 行为一致）
3. WHEN API 返回分页数据 THEN THE Generated_Types SHALL 正确定义分页响应结构（rows、total、pageNum、pageSize、pages）

### Requirement 8: 工具选型与配置

**User Story:** 作为开发者，我希望使用成熟稳定的代码生成工具，以便获得良好的社区支持和文档。

#### Acceptance Criteria

1. THE Code_Generator SHALL 基于成熟的 OpenAPI 代码生成工具（如 openapi-typescript-codegen、@hey-api/openapi-ts 或 orval）
2. THE Code_Generator SHALL 支持自定义模板或插件机制，以适配项目特定需求
3. THE Code_Generator 配置文件 SHALL 放置在 `admin-naive-ui/` 目录下
4. THE Code_Generator SHALL 支持 OpenAPI 3.0 规范

