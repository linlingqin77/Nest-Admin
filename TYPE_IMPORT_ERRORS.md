# 前端项目类型导入错误分析报告

## 汇总
**总共发现 8 个错误的类型导入**

---

## 详细列表

### 1. DataSourceInfo → DataSourceResponseDto
**错误的类型名**: `DataSourceInfo`  
**正确的类型名**: `DataSourceResponseDto`  
**位置**:
- [src/views/tool/gen/datasource/index.vue](src/views/tool/gen/datasource/index.vue#L4)
- [src/views/tool/gen/datasource/modules/datasource-operate-drawer.vue](src/views/tool/gen/datasource/modules/datasource-operate-drawer.vue#L5)

**原因**: types.ts 中定义的是 `DataSourceResponseDto`，而不是 `DataSourceInfo`

---

### 2. DatabaseType → 'postgresql' | 'mysql' | 'sqlite'
**错误的类型名**: `DatabaseType`  
**建议**: 移除导入，使用内联类型  
**位置**:
- [src/views/tool/gen/datasource/modules/datasource-operate-drawer.vue](src/views/tool/gen/datasource/modules/datasource-operate-drawer.vue#L6)

**原因**: types.ts 中没有此类型定义，数据库类型在 `CreateDataSourceDto` 等 Dto 中是内联定义的联合类型

---

### 3. DeptTreeNodeVo → DeptTreeNodeResponseDto
**错误的类型名**: `DeptTreeNodeVo`  
**正确的类型名**: `DeptTreeNodeResponseDto`  
**位置**:
- [src/views/system/user/index.vue](src/views/system/user/index.vue#L7)
- [src/views/system/user/modules/user-operate-drawer.vue](src/views/system/user/modules/user-operate-drawer.vue#L5)
- [src/views/system/role/modules/role-data-scope-drawer.vue](src/views/system/role/modules/role-data-scope-drawer.vue#L6)

**原因**: types.ts 中定义的是 `DeptTreeNodeResponseDto`（树结构节点），而不是 `Vo` 后缀

---

### 4. GenHistoryInfo → 缺失定义
**错误的类型名**: `GenHistoryInfo`  
**状态**: ⚠️ 无对应类型，需补充定义  
**位置**:
- [src/views/tool/gen/history/index.vue](src/views/tool/gen/history/index.vue#L10)
- [src/views/tool/gen/history/modules/history-detail-drawer.vue](src/views/tool/gen/history/modules/history-detail-drawer.vue#L8)

**原因**: types.ts 中完全没有此类型定义，需要从后端 API 文档中补充

---

### 5. PreviewFile → 缺失定义
**错误的类型名**: `PreviewFile`  
**状态**: ⚠️ 无对应类型，需本地定义  
**位置**:
- [src/views/tool/gen/history/modules/history-detail-drawer.vue](src/views/tool/gen/history/modules/history-detail-drawer.vue#L8)

**原因**: types.ts 中没有此类型定义，可能是项目特定的自定义类型或需要补充

---

### 6. TemplateGroupInfo → TemplateGroupResponseDto
**错误的类型名**: `TemplateGroupInfo`  
**正确的类型名**: `TemplateGroupResponseDto`  
**位置**:
- [src/views/tool/gen/template/index.vue](src/views/tool/gen/template/index.vue#L10)
- [src/views/tool/gen/template/modules/template-group-operate-drawer.vue](src/views/tool/gen/template/modules/template-group-operate-drawer.vue#L4)

**原因**: types.ts 中定义的是 `TemplateGroupResponseDto`，而不是 `Info` 后缀

---

### 7. TemplateInfo → TemplateResponseDto
**错误的类型名**: `TemplateInfo`  
**正确的类型名**: `TemplateResponseDto`  
**位置**:
- [src/views/tool/gen/template/index.vue](src/views/tool/gen/template/index.vue#L10)
- [src/views/tool/gen/template/modules/template-editor-drawer.vue](src/views/tool/gen/template/modules/template-editor-drawer.vue#L5)

**原因**: types.ts 中定义的是 `TemplateResponseDto`，而不是 `Info` 后缀

---

### 8. TemplateLanguage → 'typescript' | 'vue' | 'sql'
**错误的类型名**: `TemplateLanguage`  
**建议**: 移除导入，使用内联类型  
**位置**:
- [src/views/tool/gen/template/index.vue](src/views/tool/gen/template/index.vue#L10)
- [src/views/tool/gen/template/modules/template-editor-drawer.vue](src/views/tool/gen/template/modules/template-editor-drawer.vue#L5)

**原因**: types.ts 中没有 `TemplateLanguage` 类型定义，语言类型在 `CreateTemplateDto` 等 Dto 中是内联定义的联合类型

---

## 修复优先级

| 优先级 | 错误的导入 | 正确的类型 | 影响文件数 | 修复难度 |
|------|----------|----------|---------|--------|
| 🔴 高 | `DeptTreeNodeVo` | `DeptTreeNodeResponseDto` | 3 | 低 |
| 🔴 高 | `TemplateInfo` | `TemplateResponseDto` | 2 | 低 |
| 🔴 高 | `TemplateGroupInfo` | `TemplateGroupResponseDto` | 2 | 低 |
| 🟡 中 | `DataSourceInfo` | `DataSourceResponseDto` | 2 | 低 |
| 🟡 中 | `DatabaseType` | 移除，使用内联 | 1 | 低 |
| 🟡 中 | `TemplateLanguage` | 移除，使用内联 | 2 | 低 |
| 🔵 低 | `GenHistoryInfo` | 需补充定义 | 2 | 高 |
| 🔵 低 | `PreviewFile` | 需补充定义 | 1 | 高 |

---

## 快速修复方案

### 方案 A：直接替换（推荐）
1. `DeptTreeNodeVo` → `DeptTreeNodeResponseDto` (3个文件)
2. `TemplateInfo` → `TemplateResponseDto` (2个文件)
3. `TemplateGroupInfo` → `TemplateGroupResponseDto` (2个文件)
4. `DataSourceInfo` → `DataSourceResponseDto` (2个文件)

### 方案 B：处理内联类型
1. 在 `datasource-operate-drawer.vue` 中移除 `DatabaseType` 导入，改用内联类型定义
2. 在 `template/index.vue` 和 `template-editor-drawer.vue` 中移除 `TemplateLanguage` 导入

### 方案 C：补充缺失类型
1. 检查后端 API 文档，在 types.ts 中补充 `GenHistoryInfo` 和 `PreviewFile` 的定义
2. 或者在各自的 Vue 文件中本地定义这两个接口

---

## 统计信息

- **总错误数**: 8
- **可直接修复**: 6 个（替换为 types.ts 中的同义类型）
- **需内联处理**: 2 个（使用联合类型替代）
- **需补充定义**: 2 个（缺失类型）
- **影响文件总数**: 14 个文件
