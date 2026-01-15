# Design Document: OpenAPI 代码生成

## Overview

本设计文档描述了基于 OpenAPI 规范自动生成前端 API 调用代码和 TypeScript 类型定义的技术方案。该方案使用 `@hey-api/openapi-ts` 作为核心代码生成工具，通过自定义配置和模板适配项目现有的代码风格和 request 封装。

### 设计目标

1. **自动化**: 通过一条命令完成 API 代码和类型的生成
2. **类型安全**: 生成完整的 TypeScript 类型定义
3. **无缝集成**: 复用项目现有的 request 封装
4. **渐进迁移**: 生成代码与手写代码共存，支持逐步迁移

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        代码生成流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ OpenAPI Spec │───▶│ @hey-api/   │───▶│ Generated Code   │  │
│  │ (openApi.json)│    │ openapi-ts  │    │                  │  │
│  └──────────────┘    └──────────────┘    │ ├─ api-gen/      │  │
│                             │             │ │  ├─ auth.ts    │  │
│                             │             │ │  ├─ system/    │  │
│                             ▼             │ │  └─ index.ts   │  │
│                      ┌──────────────┐    │ └─ typings/      │  │
│                      │ Custom Config│    │    └─ api-gen/   │  │
│                      │ & Templates  │    └──────────────────┘  │
│                      └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 目录结构

```
admin-naive-ui/
├── openapi-ts.config.ts          # 代码生成配置文件
├── src/
│   ├── service/
│   │   ├── api/                  # 现有手写 API（保留）
│   │   ├── api-gen/              # 自动生成的 API
│   │   │   ├── index.ts          # 统一导出
│   │   │   ├── auth.ts           # 认证模块 API
│   │   │   ├── system-user.ts    # 用户管理 API
│   │   │   ├── system-role.ts    # 角色管理 API
│   │   │   └── ...
│   │   └── request/              # 请求封装（不变）
│   └── typings/
│       ├── api/                  # 现有手写类型（保留）
│       └── api-gen/              # 自动生成的类型
│           ├── index.ts          # 统一导出
│           └── schemas.ts        # 所有 schema 类型
└── package.json                  # 添加 gen:api 脚本
```

## Components and Interfaces

### 1. 代码生成配置 (openapi-ts.config.ts)

```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: false, // 不使用内置 client，使用自定义 request
  input: '../server/public/openApi.json',
  output: {
    path: 'src/service/api-gen',
    format: 'prettier',
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      output: '../typings/api-gen',
    },
    {
      name: '@hey-api/services',
      asClass: false, // 生成函数而非类
      operationId: true, // 使用 operationId 作为函数名
    },
  ],
});
```

### 2. 自定义请求适配器

由于 `@hey-api/openapi-ts` 默认生成的代码使用其内置 client，我们需要创建一个适配层来使用项目的 request 实例。

```typescript
// src/service/api-gen/request-adapter.ts
import { request } from '../request';
import type { RequestConfig } from './types';

/**
 * 适配器：将生成的请求配置转换为项目 request 格式
 */
export async function apiRequest<T>(config: RequestConfig): Promise<T> {
  const { method, url, data, params, headers } = config;
  
  return request<T>({
    method,
    url,
    data,
    params,
    headers,
  });
}
```

### 3. 生成的 API 函数格式

```typescript
// src/service/api-gen/auth.ts
// @generated - 此文件由 openapi-ts 自动生成，请勿手动修改

import { apiRequest } from './request-adapter';
import type { 
  LoginRequestDto, 
  LoginResponseDto,
  CaptchaResponseDto 
} from '@/typings/api-gen';

/**
 * 用户登录
 * @description 用户登录接口，需要用户名、密码和验证码
 */
export function fetchAuthLogin(data: LoginRequestDto) {
  return apiRequest<LoginResponseDto>({
    method: 'POST',
    url: '/auth/login',
    data,
    headers: {
      isToken: false,
      isEncrypt: 'true',
      repeatSubmit: false,
    },
  });
}

/**
 * 获取验证码图片
 * @description 获取登录/注册所需的图形验证码
 */
export function fetchCaptchaImage() {
  return apiRequest<CaptchaResponseDto>({
    method: 'GET',
    url: '/captchaImage',
  });
}
```

### 4. 生成的类型定义格式

```typescript
// src/typings/api-gen/schemas.ts
// @generated - 此文件由 openapi-ts 自动生成，请勿手动修改

export namespace ApiGen {
  /** 登录请求参数 */
  export interface LoginRequestDto {
    /** 用户名 */
    userName: string;
    /** 密码 */
    password: string;
    /** 验证码 */
    code: string;
    /** 验证码 UUID */
    uuid: string;
    /** 租户ID */
    tenantId?: string;
  }

  /** 登录响应数据 */
  export interface LoginResponseDto {
    /** 访问令牌 */
    token: string;
  }

  /** 验证码响应 */
  export interface CaptchaResponseDto {
    /** 是否开启验证码 */
    captchaEnabled: boolean;
    /** 验证码图片 Base64 */
    img?: string;
    /** 验证码 UUID */
    uuid?: string;
  }

  /** 分页响应基础结构 */
  export interface PageResult<T> {
    /** 数据列表 */
    rows: T[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    pageNum: number;
    /** 每页条数 */
    pageSize: number;
    /** 总页数 */
    pages: number;
  }
}
```

### 5. 自定义配置文件

用于定义特定 API 的自定义请求配置：

```typescript
// src/service/api-gen/api-config.ts
export interface ApiCustomConfig {
  /** 是否需要加密 */
  isEncrypt?: boolean;
  /** 是否防重复提交 */
  repeatSubmit?: boolean;
  /** 是否需要 token */
  isToken?: boolean;
}

/**
 * API 自定义配置映射
 * key: operationId
 */
export const apiCustomConfigs: Record<string, ApiCustomConfig> = {
  // 登录接口需要加密，不需要 token
  'AuthController_login_v1': {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false,
  },
  // 注册接口需要加密，不需要 token
  'MainController_register_v1': {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false,
  },
  // 重置密码需要加密
  'UserController_resetPwd_v1': {
    isEncrypt: true,
    repeatSubmit: false,
  },
};
```

## Data Models

### OpenAPI Schema 到 TypeScript 类型映射

| OpenAPI Type | TypeScript Type |
|--------------|-----------------|
| `string` | `string` |
| `integer` | `number` |
| `number` | `number` |
| `boolean` | `boolean` |
| `array` | `T[]` |
| `object` | `interface` |
| `enum` | `union type` |
| `$ref` | 引用对应 interface |
| `nullable: true` | `T \| null` |
| `required: false` | `prop?: T` |

### Result 包装类型处理

后端 API 返回统一的 `Result<T>` 格式：

```typescript
interface Result<T> {
  code: number;
  msg: string;
  data: T;
}
```

由于项目的 `transformBackendResponse` 已经解包了 `data`，生成的 API 函数返回类型应该直接是 `T`。

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 生成代码使用正确的 request 导入

*For any* 生成的 API 文件，该文件应该包含从 `../request` 或 `./request-adapter` 导入 request 的语句，且不应该包含其他 HTTP 客户端的导入。

**Validates: Requirements 1.4, 6.3**

### Property 2: API 代码格式正确性

*For any* 生成的 API 函数：
- 应该使用 `request<T>()` 或 `apiRequest<T>()` 泛型调用方式
- 应该包含 JSDoc 注释
- POST/PUT/PATCH 请求应该使用 `data` 参数
- 带查询参数的请求应该使用 `params` 参数
- 带路径参数的 URL 应该正确替换参数

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 3: 类型转换正确性

*For any* OpenAPI schema 定义：
- 生成的 TypeScript 类型应该正确映射基础类型
- 非 required 字段应该使用 `?` 标记
- nullable 字段应该包含 `| null`
- 嵌套对象和数组应该正确递归处理

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 4: Schema 完整性

*For any* OpenAPI 规范文件，生成的类型定义应该包含规范中定义的所有 schemas，且数量一致。

**Validates: Requirements 4.1**

### Property 5: 自定义配置正确应用

*For any* 在 `apiCustomConfigs` 中配置的 API：
- 如果配置了 `isEncrypt: true`，生成的代码应该包含 `isEncrypt: 'true'` header
- 如果配置了 `repeatSubmit: false`，生成的代码应该包含 `repeatSubmit: false` header
- 如果配置了 `isToken: false`，生成的代码应该包含 `isToken: false` header

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 6: 按 Tags 分组生成文件

*For any* OpenAPI 规范中的 API 端点，应该根据其 tags 属性生成到对应的文件中。相同 tag 的 API 应该在同一个文件中。

**Validates: Requirements 2.2**

### Property 7: 响应类型正确解包

*For any* 返回 `Result<T>` 包装类型的 API，生成的函数返回类型应该是解包后的 `T` 类型，而不是完整的 `Result<T>`。

**Validates: Requirements 7.1, 7.2**

### Property 8: 分页响应结构正确

*For any* 返回分页数据的 API，生成的类型应该包含 `rows`、`total`、`pageNum`、`pageSize`、`pages` 字段。

**Validates: Requirements 7.3**

## Error Handling

### 生成时错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| OpenAPI 文件不存在 | 输出错误信息，退出码 1 |
| OpenAPI 格式无效 | 输出解析错误详情，退出码 1 |
| 输出目录无写权限 | 输出权限错误，退出码 1 |
| 配置文件语法错误 | 输出配置错误详情，退出码 1 |

### 运行时错误处理

生成的 API 函数使用项目现有的 request 封装，错误处理逻辑保持不变：
- 网络错误：由 request 拦截器统一处理
- 业务错误：由 request 的 `onBackendFail` 处理
- 认证错误：自动跳转登录页

## Testing Strategy

### 单元测试

1. **类型生成测试**: 验证 OpenAPI schema 到 TypeScript 类型的转换正确性
2. **API 函数生成测试**: 验证生成的函数格式符合规范
3. **配置应用测试**: 验证自定义配置正确应用到生成的代码

### 属性测试

使用 `fast-check` 进行属性测试：

1. **Schema 完整性测试**: 生成随机 OpenAPI schema，验证生成的类型数量一致
2. **类型映射测试**: 生成随机类型定义，验证映射正确性
3. **配置应用测试**: 生成随机配置，验证正确应用

### 集成测试

1. **端到端生成测试**: 使用实际的 `openApi.json` 执行生成，验证输出文件
2. **API 调用测试**: 使用生成的 API 函数进行实际请求测试

### 测试框架

- **单元测试**: Vitest
- **属性测试**: fast-check
- **E2E 测试**: 脚本执行验证

