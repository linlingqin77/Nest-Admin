# Design Document: Frontend Type Fixes

## Overview

本设计文档描述了系统性修复前端项目（admin-naive-ui）中 TypeScript 类型错误的方案。当前项目存在约 134 个类型错误，主要分布在视图组件、API 服务和测试辅助文件中。

修复策略采用分类处理的方式，按错误类型分组修复，确保修复的一致性和可维护性。

## Architecture

### 错误分类架构

```
类型错误
├── 第三方库类型问题 (node_modules)
│   ├── skipLibCheck 配置
│   └── 类型声明文件补充
├── 组件导入问题
│   ├── Naive UI 组件导入
│   └── 全局组件声明
├── DataTable 列类型问题
│   ├── render 函数签名
│   └── 泛型类型推断
├── 可空类型问题
│   ├── null/undefined 处理
│   └── 类型断言/默认值
├── DTO 类型问题
│   ├── 属性缺失
│   └── 类型不匹配
└── 表单模型类型问题
    ├── 自定义属性定义
    └── 类型扩展
```

## Components and Interfaces

### 1. TypeScript 配置修改

修改 `tsconfig.json` 添加 `skipLibCheck: true` 以跳过 node_modules 中的类型检查：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    // ... existing options
    "skipLibCheck": true  // 跳过 node_modules 类型检查
  }
}
```

### 2. Naive UI 组件导入模式

对于在 render 函数中使用的 Naive UI 组件，需要显式导入：

```typescript
// 修复前
render(row: SomeDto) {
  return <NTag>{row.status}</NTag>;  // Error: Cannot find name 'NTag'
}

// 修复后
import { NTag } from 'naive-ui';

render(row: SomeDto) {
  return <NTag>{row.status}</NTag>;  // OK
}
```

### 3. DataTable 列类型修复模式

当前问题：render 函数的 row 参数被推断为 `{ index: number }` 而非实际数据类型。

解决方案：使用泛型类型注解或显式类型断言：

```typescript
// 方案 A: 在 render 函数中显式声明 row 类型
{
  key: 'status',
  title: '状态',
  render(row: TenantResponseDto) {
    return <DictTag value={row.status} dictCode="sys_normal_disable" />;
  },
}

// 方案 B: 使用类型断言（不推荐，但可作为临时方案）
{
  key: 'status',
  title: '状态',
  render(row) {
    const data = row as TenantResponseDto;
    return <DictTag value={data.status} dictCode="sys_normal_disable" />;
  },
}
```

### 4. Select 选项类型修复

对于包含 null 值的选项，需要使用正确的类型：

```typescript
// 修复前
const options = [
  { label: '全部', value: null },  // Error: missing 'type' property
  { label: '启用', value: '0' },
];

// 修复后 - 方案 A: 使用空字符串代替 null
const options = [
  { label: '全部', value: '' },
  { label: '启用', value: '0' },
];

// 修复后 - 方案 B: 使用 undefined
const options = [
  { label: '全部', value: undefined },
  { label: '启用', value: '0' },
];
```

### 5. 表单模型类型扩展

对于需要额外属性的表单模型，扩展类型定义：

```typescript
// 修复前
type Model = Partial<CreateDeptRequestDto & UpdateDeptRequestDto>;
// Error: 'deptCategory' does not exist on type 'Model'

// 修复后
type Model = Partial<CreateDeptRequestDto & UpdateDeptRequestDto> & {
  deptId?: number;
  deptCategory?: string;  // 添加自定义属性
};
```

### 6. 可空类型处理模式

```typescript
// 修复前
const value: string = someNullableValue;  // Error: Type 'null' is not assignable

// 修复后 - 方案 A: 使用空值合并
const value: string = someNullableValue ?? '';

// 修复后 - 方案 B: 使用类型断言（确保值不为 null 时）
const value: string = someNullableValue!;

// 修复后 - 方案 C: 使用条件检查
if (someNullableValue) {
  const value: string = someNullableValue;
}
```

## Data Models

### 需要修改的类型定义

1. **CreateDeptRequestDto** - 需要添加 `deptCategory` 属性（如果后端支持）
2. **Model 类型** - 在各表单组件中扩展以包含所有使用的属性
3. **SearchParams 类型** - 确保包含所有搜索参数属性

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本功能主要涉及类型修复，所有验证都是通过 TypeScript 编译器进行的静态检查，而非运行时属性测试。验证方法是运行 `vue-tsc --noEmit` 并确保源代码文件中没有类型错误。

**Property 1: 类型检查通过**

*For any* source file in the `src/` directory, running `vue-tsc --noEmit` SHALL produce zero type errors.

**Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3, 8.1, 8.2**

**Property 2: 测试文件类型检查**

*For any* test file in the `test/` directory, running `vue-tsc --noEmit` SHALL produce zero type errors.

**Validates: Requirements 7.1, 7.2**

## Error Handling

### 类型错误处理策略

1. **优先使用类型安全的修复方式**
   - 使用空值合并运算符 `??` 而非类型断言
   - 使用可选链 `?.` 访问可能为 null 的属性
   - 使用类型守卫进行类型收窄

2. **避免过度使用 `any` 类型**
   - 仅在必要时使用 `as any` 类型断言
   - 优先使用具体类型或 `unknown`

3. **保持向后兼容**
   - 修复不应改变运行时行为
   - 仅修改类型注解和导入语句

## Testing Strategy

### 验证方法

1. **静态类型检查**
   - 运行 `pnpm vue-tsc --noEmit` 验证所有类型错误已修复
   - 目标：源代码文件中零类型错误

2. **构建验证**
   - 运行 `pnpm build` 确保项目可以成功构建
   - 验证修复不会引入运行时错误

3. **单元测试**
   - 运行 `pnpm test` 确保现有测试仍然通过
   - 验证类型修复不会破坏现有功能

### 测试命令

```bash
# 类型检查
pnpm vue-tsc --noEmit

# 构建验证
pnpm build

# 单元测试
pnpm test
```

### 验收标准

- `vue-tsc --noEmit` 在 `src/` 目录下输出零错误
- `pnpm build` 成功完成
- 所有现有单元测试通过
