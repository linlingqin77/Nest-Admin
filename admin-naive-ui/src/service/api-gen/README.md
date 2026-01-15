# API 代码生成目录

> ⚠️ **警告**: 此目录下的文件由 OpenAPI 规范自动生成，请勿手动修改！

## 目录结构

```
api-gen/
├── README.md           # 本文件
├── index.ts            # 统一导出入口
├── types.ts            # TypeScript 类型定义
├── request-adapter.ts  # 请求适配器（可自定义）
├── api-config.ts       # API 自定义配置（可自定义）
└── *.ts                # 按模块分组的 API 文件
```

## 使用方法

### 导入 API 函数

```typescript
// 导入单个 API
import { fetchAuthLogin, fetchUserFindAll } from '@/service/api-gen';

// 导入类型
import type { AuthLoginRequestDto, UserResponseDto } from '@/service/api-gen';
```

### 调用 API

```typescript
// 登录
const result = await fetchAuthLogin({
  userName: 'admin',
  password: '123456',
});

// 获取用户列表
const users = await fetchUserFindAll({
  pageNum: 1,
  pageSize: 10,
});
```

## 重新生成

当后端 API 发生变化时，运行以下命令重新生成：

```bash
pnpm gen:api
```

生成脚本会：
1. 读取 `server/public/openApi.json` 规范文件
2. 生成类型定义到 `types.ts`
3. 按 tags 分组生成 API 文件
4. 更新 `index.ts` 导出

## 自定义配置

### 请求适配器 (`request-adapter.ts`)

适配器将生成的 API 调用转换为项目的 request 格式。如需修改请求行为，可以编辑此文件。

### API 配置 (`api-config.ts`)

用于配置特定 API 的行为，如：
- `encrypt`: 是否加密请求数据
- `withToken`: 是否携带 Token
- `repeatSubmit`: 是否允许重复提交

示例：

```typescript
export const apiCustomConfigs: Record<string, ApiCustomConfig> = {
  'AuthController_login_v1': {
    encrypt: true,      // 登录接口加密
    withToken: false,   // 登录不需要 Token
  },
};
```

## 文件说明

| 文件 | 说明 | 可修改 |
|------|------|--------|
| `types.ts` | 类型定义 | ❌ |
| `index.ts` | 导出入口 | ❌ |
| `*.ts` (API 文件) | API 函数 | ❌ |
| `request-adapter.ts` | 请求适配器 | ✅ |
| `api-config.ts` | 自定义配置 | ✅ |

## 生成时间

查看各文件头部的 `@generated` 注释获取生成时间。
