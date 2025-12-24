# 验证码配置缓存问题修复

## 问题描述

生产环境中 `/auth/code` 接口返回的 `captchaEnabled` 字段值不稳定，有时是 `true`，有时是 `false`。

## 问题根源

### 1. 缓存键缺少租户ID

**问题代码** (`config.service.ts`):
```typescript
@Cacheable(CacheEnum.SYS_CONFIG_KEY, '{configKey}')
async getConfigValue(configKey: string) {
  const data = await this.configRepo.findByConfigKey(configKey);
  return data?.configValue ?? null;
}
```

- 缓存键格式：`SYS_CONFIG:sys.account.captchaEnabled`
- **问题**：不同租户共享同一个缓存键
- **影响**：
  - 租户A查询配置 → 缓存 `SYS_CONFIG:sys.account.captchaEnabled` = `true`
  - 租户B查询配置 → 使用租户A的缓存，即使租户B的配置可能不同
  - 未认证请求（无租户ID）→ 查询失败返回 `null`（转为 `false`）

### 2. `/auth/code` 接口未忽略租户隔离

**问题代码** (`auth.controller.ts`):
```typescript
@Get('code')
@NotRequireAuth()
async getCaptchaCode(): Promise<Result> {
  // 此接口会尝试根据当前租户ID查询配置
  // 但登录前的请求通常没有租户信息
}
```

- **问题**：登录前的请求不会携带租户ID
- **影响**：Prisma 租户扩展会过滤查询，导致查不到配置

## 解决方案

### 1. 修改 `@Cacheable` 装饰器，在缓存键中包含租户ID

**文件**: `server/src/common/decorators/redis.decorator.ts`

```typescript
import { TenantContext } from '../tenant';

export function Cacheable(CACHE_NAME: string, CACHE_KEY: string, CACHE_EXPIRESIN: number = 3600) {
  // ...
  descriptor.value = async function (...args: any[]) {
    const key = paramsKeyFormat(originMethod, CACHE_KEY, args);
    
    // 包含租户ID到缓存键中（如果存在）
    const tenantId = TenantContext.getTenantId();
    const fullKey = tenantId ? `${CACHE_NAME}${tenantId}:${key}` : `${CACHE_NAME}${key}`;
    
    const cacheResult = await this.redis.get(fullKey);
    // ...
  };
}
```

**变化**:
- 旧格式: `SYS_CONFIG:sys.account.captchaEnabled`
- 新格式: `SYS_CONFIG:000000:sys.account.captchaEnabled` (带租户ID)
- 无租户: `SYS_CONFIG:sys.account.captchaEnabled` (无租户场景)

### 2. 为 `/auth/code` 接口添加 `@IgnoreTenant()` 装饰器

**文件**: `server/src/module/main/auth.controller.ts`

```typescript
@Get('code')
@NotRequireAuth()
@IgnoreTenant()  // 新增：忽略租户过滤
async getCaptchaCode(): Promise<Result> {
  // 确保使用超级租户(000000)的配置
  const enable = await this.sysConfigService.getConfigValue('sys.account.captchaEnabled');
  // ...
}
```

**效果**:
- 所有验证码请求都使用超级租户 `000000` 的配置
- 与 `/auth/tenant/list` 保持一致的行为

### 3. 同步修改 `@CacheEvict` 装饰器

确保缓存失效时也使用相同的键格式：

```typescript
export function CacheEvict(CACHE_NAME: string, CACHE_KEY: string) {
  // ...
  const tenantId = TenantContext.getTenantId();
  const fullKey = tenantId ? `${CACHE_NAME}${tenantId}:${key}` : `${CACHE_NAME}${key}`;
  await this.redis.del(fullKey);
  // ...
}
```

## 部署步骤

### 1. 清理旧缓存（可选）

```bash
cd server
npx tsx scripts/clear-config-cache.ts
```

或手动清理 Redis：
```bash
redis-cli -a 123456 -n 2
> KEYS SYS_CONFIG:*
> DEL SYS_CONFIG:sys.account.captchaEnabled
```

### 2. 重启后端服务

```bash
cd server
pnpm build:prod
pm2 restart nest-admin-soybean
```

或在开发环境：
```bash
pnpm start:dev
```

## 验证修复

### 1. 检查验证码接口

```bash
# 无租户头
curl https://linlingqin.top/prod-api/auth/code

# 应返回一致的 captchaEnabled 值
{
  "code": "0000",
  "data": {
    "captchaEnabled": true,
    "uuid": "xxx",
    "img": "data:image/svg+xml;base64,..."
  }
}
```

### 2. 检查缓存键

连接 Redis 查看新的缓存键格式：
```bash
redis-cli -a 123456 -n 2
> KEYS SYS_CONFIG:*
1) "SYS_CONFIG:sys.account.captchaEnabled"  # 无租户场景
2) "SYS_CONFIG:000000:sys.account.captchaEnabled"  # 超级租户
```

## 影响范围

### 受影响的缓存方法

所有使用 `@Cacheable` 和 `@CacheEvict` 装饰器的方法都会自动包含租户ID：

1. `ConfigService.getConfigValue()` - 系统配置
2. `DeptService` - 部门服务的多个方法
3. `DictService.getAllDict()` - 字典数据
4. `MenuService.getMenuListByUserId()` - 菜单权限
5. `UserService.findOne()` - 用户信息
6. `UserAuthService.getPermissions()` - 用户权限

### 向后兼容性

- ✅ 新代码会自动生成带租户ID的缓存键
- ✅ 无租户场景（如登录前）会使用不带租户ID的键
- ⚠️ 旧缓存会失效，首次查询会重新缓存（性能影响微小）

## 最佳实践

### 何时使用 `@IgnoreTenant()`

对于登录前可访问的端点，应添加此装饰器：
- ✅ `/auth/code` - 验证码
- ✅ `/auth/tenant/list` - 租户列表
- ✅ `/auth/login` - 登录（已存在）
- ❌ `/system/user/list` - 需要租户隔离

### 缓存键命名规范

```typescript
// 推荐：包含完整的业务标识
@Cacheable(CacheEnum.SYS_CONFIG_KEY, '{configKey}')

// 缓存键会自动变为：
// SYS_CONFIG:<tenantId>:<configKey>
// 例如: SYS_CONFIG:000000:sys.account.captchaEnabled
```

## 相关文件

- `server/src/common/decorators/redis.decorator.ts` - Redis缓存装饰器
- `server/src/module/main/auth.controller.ts` - 认证控制器
- `server/src/module/system/config/config.service.ts` - 配置服务
- `server/src/common/tenant/tenant.context.ts` - 租户上下文
- `server/scripts/clear-config-cache.ts` - 缓存清理脚本

## 测试建议

1. **单元测试**：验证缓存键格式
2. **集成测试**：测试多租户场景下的配置隔离
3. **压力测试**：确认缓存性能未降低
4. **手工测试**：多次调用 `/auth/code` 确认返回一致

---

**修复日期**: 2025-12-24  
**修复人员**: GitHub Copilot  
**问题追踪**: 验证码配置不稳定
