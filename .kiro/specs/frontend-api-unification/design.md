# Design Document: Frontend API Unification

## Overview

本设计文档描述了前端手写 API 接口的清理和统一方案。通过分析前端代码中 API 的使用情况，删除未使用的接口，对于正在使用但后端缺失的接口进行后端补全，最终将前端代码迁移到使用生成的 API。

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vue3)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Hand-Written   │    │   Generated     │                    │
│  │     APIs        │───▶│     APIs        │                    │
│  │ (src/service/   │    │ (src/service/   │                    │
│  │     api/)       │    │    api-gen/)    │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ▼                                          │
│              ┌───────────────┐                                  │
│              │    Request    │                                  │
│              │    Adapter    │                                  │
│              └───────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (NestJS)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Controllers   │───▶│    Services     │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                      │                              │
│           ▼                      ▼                              │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   OpenAPI Spec  │    │     Prisma      │                    │
│  │   Generation    │    │   Repository    │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 迁移流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   分析阶段   │────▶│   清理阶段   │────▶│   迁移阶段   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
  识别 API 使用        删除未使用 API      替换为生成 API
  识别后端缺失        后端补全功能        更新导入语句
  标记特殊 API        重新生成 API        删除手写 API
```

## Components and Interfaces

### 1. 前端 API 层

#### 1.1 手写 API 目录结构（当前）

```
admin-naive-ui/src/service/api/
├── index.ts                    # 主导出文件
├── system/
│   ├── index.ts               # 系统模块导出
│   ├── user.ts                # 用户相关 API（部分保留）
│   ├── social.ts              # 社交登录 API（迁移）
│   ├── file-manager.ts        # 文件管理 API（部分保留）
│   ├── client.ts              # 客户端管理 API（后端补全后迁移）
│   ├── oss-config.ts          # OSS 配置 API（后端补全后迁移）
│   ├── oss.ts                 # OSS 文件 API（后端补全后迁移）
│   ├── tenant-package.ts      # 租户套餐 API（迁移）
│   ├── tenant.ts              # 租户相关 API（迁移）
│   ├── config.ts              # 系统配置 API（迁移）
│   └── notify.ts              # 通知消息 API（迁移）
├── monitor/
│   ├── index.ts               # 监控模块导出
│   ├── online.ts              # 在线用户 API（迁移）
│   ├── job.ts                 # 定时任务 API（迁移）
│   └── job-log.ts             # 任务日志 API（迁移）
└── tool/
    ├── index.ts               # 工具模块导出
    └── gen.ts                 # 代码生成 API（迁移）
```

#### 1.2 生成 API 目录结构（目标）

```
admin-naive-ui/src/service/api-gen/
├── index.ts                    # 主导出文件
├── request-adapter.ts          # 请求适配器
├── types.ts                    # 类型定义
├── auth.ts                     # 认证 API
├── user.ts                     # 用户 API
├── dept.ts                     # 部门 API
├── role.ts                     # 角色 API
├── menu.ts                     # 菜单 API
├── tenant.ts                   # 租户 API
├── tenant-package.ts           # 租户套餐 API
├── tenant-quota.ts             # 租户配额 API
├── tenant-audit.ts             # 租户审计 API
├── tenant-dashboard.ts         # 租户仪表盘 API
├── config.ts                   # 系统配置 API
├── notify-message.ts           # 通知消息 API
├── online.ts                   # 在线用户 API
├── job.ts                      # 定时任务 API
├── job-log.ts                  # 任务日志 API
├── tool.ts                     # 代码生成 API
├── client.ts                   # 客户端管理 API（新增）
├── oss-config.ts               # OSS 配置 API（新增）
├── oss.ts                      # OSS 文件 API（新增）
└── ...                         # 其他已有 API
```

### 2. 后端 API 层

#### 2.1 需要新增的模块

##### 2.1.1 客户端管理模块

```typescript
// server/src/module/system/client/client.controller.ts
@ApiTags('客户端管理')
@Controller('system/client')
@ApiBearerAuth('Authorization')
export class ClientController {
  @Get('list')
  @Api({ summary: '获取客户端列表' })
  findAll(@Query() query: ListClientDto): Promise<Result<PageData<ClientResponseDto>>>;

  @Post()
  @Api({ summary: '新增客户端' })
  create(@Body() dto: CreateClientDto): Promise<Result<boolean>>;

  @Put()
  @Api({ summary: '修改客户端' })
  update(@Body() dto: UpdateClientDto): Promise<Result<boolean>>;

  @Put('changeStatus')
  @Api({ summary: '修改客户端状态' })
  changeStatus(@Body() dto: ChangeStatusDto): Promise<Result<boolean>>;

  @Delete(':ids')
  @Api({ summary: '批量删除客户端' })
  remove(@Param('ids') ids: string): Promise<Result<boolean>>;
}
```

##### 2.1.2 OSS 配置管理模块

```typescript
// server/src/module/resource/oss-config/oss-config.controller.ts
@ApiTags('OSS配置管理')
@Controller('resource/oss/config')
@ApiBearerAuth('Authorization')
export class OssConfigController {
  @Get('list')
  @Api({ summary: '获取OSS配置列表' })
  findAll(@Query() query: ListOssConfigDto): Promise<Result<PageData<OssConfigResponseDto>>>;

  @Post()
  @Api({ summary: '新增OSS配置' })
  create(@Body() dto: CreateOssConfigDto): Promise<Result<boolean>>;

  @Put()
  @Api({ summary: '修改OSS配置' })
  update(@Body() dto: UpdateOssConfigDto): Promise<Result<boolean>>;

  @Put('changeStatus')
  @Api({ summary: '修改OSS配置状态' })
  changeStatus(@Body() dto: ChangeStatusDto): Promise<Result<boolean>>;

  @Delete(':ids')
  @Api({ summary: '批量删除OSS配置' })
  remove(@Param('ids') ids: string): Promise<Result<boolean>>;
}
```

##### 2.1.3 OSS 文件管理模块

```typescript
// server/src/module/resource/oss/oss.controller.ts
@ApiTags('OSS文件管理')
@Controller('resource/oss')
@ApiBearerAuth('Authorization')
export class OssController {
  @Get('list')
  @Api({ summary: '获取OSS文件列表' })
  findAll(@Query() query: ListOssDto): Promise<Result<PageData<OssResponseDto>>>;

  @Get('listByIds/:ids')
  @Api({ summary: '根据ID列表获取OSS文件' })
  findByIds(@Param('ids') ids: string): Promise<Result<OssResponseDto[]>>;

  @Post('upload')
  @Api({ summary: '上传文件' })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File): Promise<Result<OssResponseDto>>;

  @Delete(':ids')
  @Api({ summary: '批量删除OSS文件' })
  remove(@Param('ids') ids: string): Promise<Result<boolean>>;
}
```

## Data Models

### 1. 客户端管理数据模型

```typescript
// DTO 定义
interface CreateClientDto {
  clientKey: string;      // 客户端标识
  clientSecret: string;   // 客户端密钥
  grantTypes: string[];   // 授权类型
  deviceType: string;     // 设备类型
  activeTimeout?: number; // 活跃超时时间
  timeout?: number;       // 超时时间
  status?: string;        // 状态
}

interface ClientResponseDto {
  id: number;
  clientId: string;
  clientKey: string;
  clientSecret: string;
  grantTypes: string;
  deviceType: string;
  activeTimeout: number;
  timeout: number;
  status: string;
  createTime: Date;
}
```

### 2. OSS 配置数据模型

```typescript
// DTO 定义
interface CreateOssConfigDto {
  configKey: string;      // 配置标识
  accessKey: string;      // 访问密钥
  secretKey: string;      // 密钥
  bucketName: string;     // 存储桶名称
  prefix?: string;        // 前缀
  endpoint: string;       // 端点
  domain?: string;        // 域名
  isHttps?: string;       // 是否HTTPS
  region?: string;        // 区域
  accessPolicy?: string;  // 访问策略
  status?: string;        // 状态
}

interface OssConfigResponseDto {
  ossConfigId: number;
  configKey: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  prefix: string;
  endpoint: string;
  domain: string;
  isHttps: string;
  region: string;
  accessPolicy: string;
  status: string;
  createTime: Date;
}
```

### 3. OSS 文件数据模型

```typescript
// DTO 定义
interface OssResponseDto {
  ossId: number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  size: number;
  service: string;
  createTime: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Usage Detection Accuracy

*For any* API function defined in the hand-written API files, the system shall correctly identify whether it is imported and used in at least one Vue component or TypeScript file.

**Validates: Requirements 1.1, 1.3**

### Property 2: Used API Preservation

*For any* API function that is imported in at least one component, the cleanup process shall not remove it from the codebase.

**Validates: Requirements 2.3**

### Property 3: Backend API Comparison Correctness

*For any* hand-written API endpoint, the system shall correctly determine whether a corresponding backend controller route exists by comparing the URL path and HTTP method.

**Validates: Requirements 3.1, 3.2**

### Property 4: DTO Validation Completeness

*For any* backend DTO class used in request body validation, it shall have at least one class-validator decorator on each required field.

**Validates: Requirements 4.3**

### Property 5: Special API Retention

*For any* API function that uses FormData or requires special request handling (like file uploads), the system shall mark it for retention and not migrate it to generated APIs.

**Validates: Requirements 6.1**

## Error Handling

### 1. API 迁移错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 生成 API 类型不匹配 | 保留手写 API，记录警告 |
| 后端 API 返回格式变化 | 更新前端类型定义 |
| 导入路径错误 | 自动修复或提示手动修复 |
| 循环依赖 | 重构导入结构 |

### 2. 后端 API 错误处理

| 错误场景 | HTTP 状态码 | 错误码 | 处理方式 |
|---------|------------|--------|---------|
| 参数验证失败 | 400 | PARAM_INVALID | 返回详细验证错误信息 |
| 资源不存在 | 404 | DATA_NOT_FOUND | 返回资源不存在提示 |
| 权限不足 | 403 | PERMISSION_DENIED | 返回权限不足提示 |
| 服务器错误 | 500 | SYSTEM_ERROR | 记录日志，返回通用错误 |

## Testing Strategy

### 1. 单元测试

#### 1.1 后端单元测试

- 测试每个新增 Controller 的路由处理
- 测试每个新增 Service 的业务逻辑
- 测试 DTO 验证规则

```typescript
// 示例：客户端服务单元测试
describe('ClientService', () => {
  describe('findAll', () => {
    it('should return paginated client list', async () => {
      // 测试分页查询
    });
  });

  describe('create', () => {
    it('should create client with valid data', async () => {
      // 测试创建客户端
    });

    it('should reject duplicate clientKey', async () => {
      // 测试重复键名
    });
  });
});
```

#### 1.2 前端单元测试

- 测试 API 调用是否正确
- 测试类型定义是否匹配

### 2. 属性测试

使用 fast-check 进行属性测试：

```typescript
// 示例：DTO 验证属性测试
describe('CreateClientDto - Property Tests', () => {
  /**
   * Property 4: DTO Validation Completeness
   * **Validates: Requirements 4.3**
   */
  it('should validate all required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          clientKey: fc.string({ minLength: 1, maxLength: 50 }),
          clientSecret: fc.string({ minLength: 1, maxLength: 100 }),
          grantTypes: fc.array(fc.string(), { minLength: 1 }),
          deviceType: fc.string({ minLength: 1 }),
        }),
        (data) => {
          const dto = plainToInstance(CreateClientDto, data);
          const errors = validateSync(dto);
          return errors.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 3. 集成测试

- 测试完整的 API 请求-响应流程
- 测试前后端数据交互

### 4. E2E 测试

- 测试用户操作流程
- 测试页面功能完整性

## Migration Plan

### 阶段 1: 清理未使用的 API

1. 删除 `fetchGetOnlineUserList`, `fetchForceLogout`, `fetchBatchGenCode`
2. 删除 `file-manager.ts` 中未使用的函数
3. 更新相关 `index.ts` 导出文件

### 阶段 2: 后端 API 补全

1. 实现客户端管理模块
2. 实现 OSS 配置管理模块
3. 实现 OSS 文件管理模块
4. 重新生成 OpenAPI 规范和前端 API

### 阶段 3: 前端 API 迁移

1. 迁移代码生成工具 API（已有生成 API）
2. 迁移租户相关 API
3. 迁移通知消息 API
4. 迁移定时任务 API
5. 迁移在线用户 API
6. 迁移系统配置 API
7. 迁移客户端管理 API（后端补全后）
8. 迁移 OSS 相关 API（后端补全后）

### 阶段 4: 清理手写 API

1. 删除已迁移的手写 API 文件
2. 保留需要特殊处理的 API（FormData 上传）
3. 更新文档说明保留原因
