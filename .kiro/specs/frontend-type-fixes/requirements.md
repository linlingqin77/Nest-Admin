# Requirements Document

## Introduction

本规范旨在系统性地修复前端项目（admin-naive-ui）中的 TypeScript 类型错误。当前项目存在约 134 个类型错误，主要分布在视图组件、API 服务和测试辅助文件中。这些错误影响了代码的类型安全性和开发体验。

## Glossary

- **Type_Checker**: TypeScript 类型检查器（vue-tsc），用于验证 Vue 和 TypeScript 代码的类型正确性
- **Naive_UI**: 项目使用的 Vue 3 UI 组件库
- **DataTable_Column**: Naive UI 数据表格的列定义类型
- **DTO**: Data Transfer Object，数据传输对象，用于 API 请求和响应
- **Render_Function**: 表格列的渲染函数，用于自定义单元格内容
- **SelectMixedOption**: Naive UI 选择器组件的选项类型

## Requirements

### Requirement 1: 修复 Naive UI 组件导入缺失

**User Story:** As a developer, I want all Naive UI components to be properly imported, so that the type checker can recognize them.

#### Acceptance Criteria

1. WHEN a Vue component uses NTag, NProgress, NEllipsis, or DataTableColumns in render functions, THE Type_Checker SHALL recognize these types without errors
2. WHEN Naive UI components are used in JSX/TSX render functions, THE Component SHALL be properly imported from naive-ui

### Requirement 2: 修复 DataTable 列渲染函数类型

**User Story:** As a developer, I want DataTable column render functions to have correct type signatures, so that row data is properly typed.

#### Acceptance Criteria

1. WHEN defining a DataTable column with a render function, THE Render_Function SHALL use the correct signature `(rowData: RowType, rowIndex: number) => VNodeChild`
2. WHEN accessing row properties in render functions, THE Type_Checker SHALL recognize all properties defined in the row type
3. WHEN a column uses a custom render function, THE row parameter type SHALL match the actual data type being rendered

### Requirement 3: 修复可空类型处理

**User Story:** As a developer, I want nullable values to be properly handled, so that null/undefined errors are prevented.

#### Acceptance Criteria

1. WHEN a value can be null or undefined, THE Code SHALL use proper null checks or default values before assignment
2. WHEN assigning a nullable value to a non-nullable type, THE Code SHALL use type narrowing or provide a fallback value
3. WHEN a function parameter expects a non-nullable type, THE Caller SHALL ensure the argument is not null/undefined

### Requirement 4: 修复 API DTO 类型不匹配

**User Story:** As a developer, I want API request/response types to match the actual data structures, so that type safety is maintained.

#### Acceptance Criteria

1. WHEN creating a request DTO, THE Object SHALL include all required properties defined in the DTO type
2. WHEN a DTO property type is an enum, THE Value SHALL be one of the valid enum values
3. WHEN a DTO has optional properties, THE Type_Checker SHALL allow undefined values for those properties

### Requirement 5: 修复 Select 组件选项类型

**User Story:** As a developer, I want Select component options to have correct types, so that null values are properly handled.

#### Acceptance Criteria

1. WHEN defining Select options with a null value, THE Option SHALL include the `type` property required by SelectMixedOption
2. WHEN using SelectMixedOption type, THE Options array SHALL conform to the union type requirements

### Requirement 6: 修复表单模型类型定义

**User Story:** As a developer, I want form model types to include all necessary properties, so that form data is properly typed.

#### Acceptance Criteria

1. WHEN a form model includes custom properties like deptCategory, THE Model type SHALL define these properties
2. WHEN updating a form model, THE Update DTO SHALL include all properties being modified
3. WHEN form data is submitted, THE Request DTO SHALL match the expected API parameter type

### Requirement 7: 修复测试辅助函数类型

**User Story:** As a developer, I want test helper functions to have correct types, so that component mounting works properly.

#### Acceptance Criteria

1. WHEN mounting a component with slots, THE Slots type SHALL be compatible with Vue Test Utils expectations
2. WHEN providing global plugins, THE Plugin array SHALL have the correct type

### Requirement 8: 修复环境变量类型定义

**User Story:** As a developer, I want environment variables to be properly typed, so that import.meta.env is correctly typed.

#### Acceptance Criteria

1. WHEN accessing import.meta.env properties, THE ImportMetaEnv interface SHALL define all custom environment variables
2. THE vite-env.d.ts file SHALL extend ImportMetaEnv with all VITE_ prefixed variables

### Requirement 9: 修复第三方库类型声明

**User Story:** As a developer, I want third-party libraries to have proper type declarations, so that type checking passes.

#### Acceptance Criteria

1. WHEN a library lacks type declarations, THE Project SHALL add @types packages or custom declarations
2. WHEN node_modules types conflict, THE tsconfig.json SHALL be configured to skip problematic type checks
