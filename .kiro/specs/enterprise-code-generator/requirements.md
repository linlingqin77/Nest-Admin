# Requirements Document

## Introduction

本文档定义了企业级代码生成器功能的需求规格。该功能旨在基于现有的代码生成器基础，扩展为支持多模板、多数据源、智能字段推断、代码预览与在线编辑、批量生成与版本管理的企业级代码生成解决方案。

## Glossary

- **Code_Generator**: 代码生成器系统，负责根据数据库表结构自动生成前后端代码
- **Gen_Table**: 代码生成表配置，存储表的元数据和生成配置
- **Gen_Table_Column**: 代码生成列配置，存储字段的元数据和生成配置
- **Template_Engine**: 模板引擎，负责将模板与数据结合生成最终代码
- **Data_Source**: 数据源，数据库连接配置
- **Field_Inference**: 字段推断引擎，根据字段名称和类型智能推断UI组件和验证规则
- **Code_Preview**: 代码预览器，在线预览和编辑生成的代码
- **Template_Group**: 模板组，一组相关的代码模板集合

## Requirements

### Requirement 1: 多数据源管理

**User Story:** As a developer, I want to manage multiple database connections, so that I can generate code from different databases in a multi-tenant or microservice architecture.

#### Acceptance Criteria

1. THE Data_Source_Manager SHALL support configuring multiple database connections with unique identifiers
2. WHEN a user adds a new data source, THE System SHALL validate the connection parameters and test connectivity
3. WHEN a user selects a data source, THE System SHALL display only tables from that specific database
4. THE System SHALL support PostgreSQL, MySQL, and SQLite database types
5. WHEN a data source connection fails, THE System SHALL display a clear error message with troubleshooting suggestions
6. THE System SHALL encrypt sensitive connection credentials (passwords) before storage

### Requirement 2: 数据库表导入与同步

**User Story:** As a developer, I want to import database tables and keep them synchronized, so that my code generation configuration stays up-to-date with schema changes.

#### Acceptance Criteria

1. WHEN a user requests to import tables, THE System SHALL display a list of available tables with their comments
2. THE System SHALL allow batch selection and import of multiple tables
3. WHEN importing a table, THE System SHALL automatically extract column metadata including name, type, comment, constraints, and defaults
4. WHEN a user triggers sync, THE System SHALL compare current schema with stored configuration and highlight differences
5. THE System SHALL support incremental sync that preserves user customizations while updating schema changes
6. WHEN columns are added or removed in the database, THE Sync_Engine SHALL update Gen_Table_Column records accordingly

### Requirement 3: 智能字段推断

**User Story:** As a developer, I want the system to intelligently infer field properties, so that I can reduce manual configuration effort.

#### Acceptance Criteria

1. WHEN a column name contains 'status', THE Field_Inference SHALL set htmlType to 'radio' or 'select'
2. WHEN a column name contains 'type' or 'sex', THE Field_Inference SHALL set htmlType to 'select'
3. WHEN a column name contains 'time' or 'date', THE Field_Inference SHALL set htmlType to 'datetime' and javaType to 'Date'
4. WHEN a column name contains 'image' or 'avatar', THE Field_Inference SHALL set htmlType to 'imageUpload'
5. WHEN a column name contains 'file', THE Field_Inference SHALL set htmlType to 'fileUpload'
6. WHEN a column name contains 'content' or 'remark', THE Field_Inference SHALL set htmlType to 'editor' or 'textarea'
7. WHEN a column name contains 'name', THE Field_Inference SHALL set queryType to 'LIKE'
8. WHEN a column is a primary key with auto-increment, THE Field_Inference SHALL exclude it from insert forms
9. FOR ALL columns, THE Field_Inference SHALL infer isRequired based on NOT NULL constraint

### Requirement 4: 表配置管理

**User Story:** As a developer, I want to configure table generation options, so that I can customize the generated code structure.

#### Acceptance Criteria

1. THE System SHALL allow configuring table-level properties: className, moduleName, businessName, functionName, functionAuthor
2. THE System SHALL allow configuring generation options: tplCategory (crud/tree/sub), tplWebType (vue3/element-plus)
3. WHEN tplCategory is 'tree', THE System SHALL require treeCode, treeParentCode, and treeName fields
4. WHEN tplCategory is 'sub', THE System SHALL require subTableName and subTableFkName fields
5. THE System SHALL validate that className follows PascalCase naming convention
6. THE System SHALL validate that moduleName and businessName follow kebab-case naming convention

### Requirement 5: 列配置管理

**User Story:** As a developer, I want to configure column generation options, so that I can control how each field is rendered and validated.

#### Acceptance Criteria

1. THE System SHALL allow configuring column properties: javaField, javaType, htmlType, dictType, queryType
2. THE System SHALL allow toggling column visibility flags: isInsert, isEdit, isList, isQuery, isRequired
3. WHEN htmlType is 'select' or 'radio' or 'checkbox', THE System SHALL allow selecting a dictionary type
4. THE System SHALL support queryType options: EQ, NE, GT, GTE, LT, LTE, LIKE, BETWEEN
5. THE System SHALL support htmlType options: input, textarea, select, radio, checkbox, datetime, imageUpload, fileUpload, editor
6. THE System SHALL allow reordering columns via drag-and-drop
7. WHEN a column has dictType configured, THE Generated_Code SHALL use dictionary translation

### Requirement 6: 模板管理

**User Story:** As a developer, I want to manage code templates, so that I can customize generated code to match our coding standards.

#### Acceptance Criteria

1. THE System SHALL provide default templates for: NestJS (controller, service, module, dto, entity) and Vue3 (api, index, dialog)
2. THE System SHALL allow creating custom template groups with unique names
3. WHEN editing a template, THE System SHALL provide syntax highlighting and variable auto-completion
4. THE System SHALL support template variables: ${tableName}, ${className}, ${columns}, ${primaryKey}, ${moduleName}, ${businessName}
5. THE System SHALL validate template syntax before saving
6. THE System SHALL allow importing and exporting template groups as JSON files

### Requirement 7: 代码预览

**User Story:** As a developer, I want to preview generated code before downloading, so that I can verify the output meets my requirements.

#### Acceptance Criteria

1. WHEN a user requests preview, THE System SHALL generate code for all configured templates
2. THE Code_Preview SHALL display generated code with syntax highlighting
3. THE Code_Preview SHALL organize files in a tree structure matching the output directory
4. THE System SHALL allow switching between different generated files in the preview
5. THE Code_Preview SHALL support copying individual file content to clipboard
6. THE System SHALL display file size and line count for each generated file

### Requirement 8: 代码生成与下载

**User Story:** As a developer, I want to generate and download code, so that I can integrate it into my project.

#### Acceptance Criteria

1. WHEN a user triggers generation, THE System SHALL create all configured template outputs
2. THE System SHALL package generated files into a ZIP archive with proper directory structure
3. THE System SHALL support batch generation for multiple tables
4. WHEN generating code, THE System SHALL use UTF-8 encoding for all files
5. THE System SHALL name the ZIP file with format: {projectName}_{timestamp}.zip
6. WHEN generation fails, THE System SHALL provide detailed error messages indicating which template failed

### Requirement 9: 生成历史与版本管理

**User Story:** As a developer, I want to track generation history, so that I can review and compare previous generations.

#### Acceptance Criteria

1. THE System SHALL record each generation event with timestamp, user, tables, and template group
2. THE System SHALL store generated code snapshots for the last 10 generations per table
3. WHEN viewing history, THE System SHALL display generation metadata and allow downloading previous versions
4. THE System SHALL allow comparing two generation versions side-by-side
5. THE System SHALL automatically clean up generations older than 30 days

### Requirement 10: 前端界面

**User Story:** As a developer, I want an intuitive UI for code generation, so that I can efficiently configure and generate code.

#### Acceptance Criteria

1. THE UI SHALL display a table list with search, filter, and pagination
2. THE UI SHALL provide a table configuration form with tabs: Basic Info, Field Config, Generation Config
3. THE UI SHALL display real-time validation feedback for configuration errors
4. THE UI SHALL support responsive layout for different screen sizes
5. WHEN importing tables, THE UI SHALL display a modal with table selection and preview
6. THE UI SHALL provide keyboard shortcuts for common operations (Ctrl+S to save, Ctrl+G to generate)

### Requirement 11: 权限控制

**User Story:** As an administrator, I want to control access to code generation features, so that I can ensure only authorized users can generate code.

#### Acceptance Criteria

1. THE System SHALL define permissions: tool:gen:list, tool:gen:query, tool:gen:add, tool:gen:edit, tool:gen:remove, tool:gen:preview, tool:gen:code
2. WHEN a user lacks required permission, THE System SHALL hide or disable the corresponding UI elements
3. THE System SHALL log all code generation operations for audit purposes
4. THE System SHALL support role-based access control for template management

### Requirement 12: 多租户支持

**User Story:** As a tenant administrator, I want code generation to be isolated per tenant, so that each tenant can have their own configurations and templates.

#### Acceptance Criteria

1. THE System SHALL associate all Gen_Table and Gen_Table_Column records with a tenantId
2. WHEN a user queries tables, THE System SHALL only return tables belonging to their tenant
3. THE System SHALL support tenant-specific template groups that are isolated from other tenants
4. THE System SHALL support system-level default templates that are shared across all tenants
5. WHEN a tenant creates a custom template, THE System SHALL store it with the tenant's tenantId
6. THE System SHALL enforce tenant isolation at the database query level using tenant context
7. WHEN generating code, THE System SHALL include tenantId in generated entity files if the table is tenant-aware

### Requirement 13: 代码兼容性与无缝集成

**User Story:** As a developer, I want generated code to be directly usable and seamlessly integrate with the current system, so that I can immediately use it without manual modifications.

#### Acceptance Criteria

1. THE Generated_Code SHALL follow the existing project structure and coding conventions
2. THE Generated_NestJS_Code SHALL use PrismaService for database operations consistent with existing modules
3. THE Generated_NestJS_Code SHALL use Result class for API responses following the unified response format
4. THE Generated_NestJS_Code SHALL include proper decorators: @ApiTags, @ApiBearerAuth, @RequirePermission
5. THE Generated_NestJS_Code SHALL extend PageQueryDto for list queries with pagination support
6. THE Generated_NestJS_Code SHALL use class-validator decorators for DTO validation
7. THE Generated_Vue_Code SHALL use Naive UI components consistent with the admin-naive-ui project
8. THE Generated_Vue_Code SHALL use the existing hooks: useTable, useTableOperate, useAuth
9. THE Generated_Vue_Code SHALL follow the existing API service pattern using fetchXxx naming convention
10. THE Generated_Vue_Code SHALL include proper TypeScript type definitions
11. THE Generated_Code SHALL include tenantId field handling for multi-tenant tables
12. THE Generated_Code SHALL include proper i18n keys for internationalization support
13. WHEN generating menu SQL, THE System SHALL output INSERT statements compatible with SysMenu table structure
14. WHEN generating permission SQL, THE System SHALL output INSERT statements for role-menu associations

### Requirement 14: 项目规范遵循

**User Story:** As a developer, I want generated code to strictly follow project coding standards, so that the code passes linting and maintains consistency with existing codebase.

#### Acceptance Criteria

1. THE Generated_Code SHALL use single quotes for strings as per project Prettier config
2. THE Generated_Code SHALL use 2-space indentation as per project ESLint config
3. THE Generated_Code SHALL include trailing commas in multi-line structures
4. THE Generated_Code SHALL use semicolons at statement ends
5. THE Generated_NestJS_Code SHALL follow the naming conventions: PascalCase for classes, camelCase for methods/variables, UPPER_SNAKE_CASE for constants
6. THE Generated_NestJS_Code SHALL use kebab-case for file names (e.g., user-service.ts)
7. THE Generated_Vue_Code SHALL use PascalCase for component file names (e.g., UserCard.vue)
8. THE Generated_Code SHALL include JSDoc comments for public methods and classes
9. THE Generated_Code SHALL pass ESLint validation without errors
10. THE Generated_Code SHALL follow the directory structure conventions defined in project-rules.md

### Requirement 15: Swagger/OpenAPI 文档生成

**User Story:** As a developer, I want generated code to include complete Swagger documentation, so that API consumers can understand and test the endpoints.

#### Acceptance Criteria

1. THE Generated_Controller SHALL include @ApiTags decorator with the functionName
2. THE Generated_Controller SHALL include @ApiOperation decorator for each endpoint with summary and description
3. THE Generated_Controller SHALL include @ApiResponse decorators for success and error responses
4. THE Generated_DTO SHALL include @ApiProperty decorator for each field with description, example, and required flag
5. THE Generated_DTO SHALL include @ApiPropertyOptional decorator for optional fields
6. WHEN a field has dictType, THE Generated_DTO SHALL include enum values in @ApiProperty
7. THE Generated_Code SHALL include @ApiDataResponse decorator for typed response documentation
8. THE Generated_Code SHALL include @ApiQuery decorators for query parameters
9. THE Generated_Code SHALL include @ApiParam decorators for path parameters
10. WHEN the API requires authentication, THE Generated_Controller SHALL include @ApiBearerAuth decorator

### Requirement 16: 性能与可靠性

**User Story:** As a developer, I want the code generator to be fast and reliable, so that I can use it efficiently in my workflow.

#### Acceptance Criteria

1. WHEN generating code for a single table, THE System SHALL complete within 2 seconds
2. WHEN generating code for 10 tables, THE System SHALL complete within 10 seconds
3. THE System SHALL handle tables with up to 100 columns without performance degradation
4. WHEN database connection is lost during operation, THE System SHALL gracefully handle the error and allow retry
5. THE System SHALL implement request rate limiting to prevent abuse
