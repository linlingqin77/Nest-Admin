# 租户管理增强功能文档

## 概述

租户管理增强功能为系统提供了完整的多租户管理能力，包括短信管理、邮件管理、站内信管理以及租户增强功能（仪表盘、配额管理、审计日志）。

## 功能模块

### 1. 短信管理 (SMS Management)

#### 1.1 短信渠道 (SMS Channel)
- 支持多渠道配置：阿里云、腾讯云等
- 渠道配置包括：API密钥、签名、回调地址等
- 支持渠道启用/停用状态管理

#### 1.2 短信模板 (SMS Template)
- 模板类型：验证码(1)、通知(2)、营销(3)
- 支持参数化模板内容
- 关联第三方平台模板ID

#### 1.3 短信日志 (SMS Log)
- 记录所有短信发送记录
- 支持发送状态追踪：发送中(0)、成功(1)、失败(2)
- 支持接收状态回调

### 2. 邮件管理 (Mail Management)

#### 2.1 邮箱账号 (Mail Account)
- SMTP服务器配置
- 支持SSL/TLS加密
- 账号启用/停用管理

#### 2.2 邮件模板 (Mail Template)
- 支持HTML富文本内容
- 参数化模板变量
- 关联发送账号

#### 2.3 邮件日志 (Mail Log)
- 完整的发送记录
- 发送状态追踪
- 错误信息记录

### 3. 站内信管理 (Notify Management)

#### 3.1 站内信模板 (Notify Template)
- 模板类型：系统通知(1)、业务通知(2)
- 参数化内容支持
- 发送人昵称配置

#### 3.2 站内信消息 (Notify Message)
- 支持多租户隔离
- 已读/未读状态管理
- 消息列表和详情查看

### 4. 租户增强功能 (Tenant Enhancement)

#### 4.1 租户仪表盘 (Tenant Dashboard)
- 租户统计概览
- 套餐分布饼图
- 租户增长趋势图
- 即将到期租户列表
- 配额使用TOP列表

#### 4.2 租户配额管理 (Tenant Quota)
- 用户数量配额
- 存储空间配额
- API调用配额
- 配额使用监控
- 配额变更记录

#### 4.3 租户审计日志 (Tenant Audit)
- 操作类型追踪：登录、登出、创建、更新、删除、权限变更、配置变更、导出
- 操作前后数据对比
- 支持按时间、操作类型、操作人筛选
- 支持导出功能

## 数据库表结构

### 短信相关表
- `sys_sms_channel` - 短信渠道表
- `sys_sms_template` - 短信模板表
- `sys_sms_log` - 短信发送日志表

### 邮件相关表
- `sys_mail_account` - 邮箱账号表
- `sys_mail_template` - 邮件模板表
- `sys_mail_log` - 邮件发送日志表

### 站内信相关表
- `sys_notify_template` - 站内信模板表
- `sys_notify_message` - 站内信消息表

### 租户增强相关表
- `sys_tenant_quota` - 租户配额表
- `sys_tenant_quota_log` - 配额变更记录表
- `sys_tenant_billing` - 租户账单表
- `sys_tenant_billing_item` - 账单明细表
- `sys_tenant_audit_log` - 租户审计日志表

## API 接口

### 短信管理接口
```
POST   /system/sms/channel          - 创建短信渠道
PUT    /system/sms/channel/:id      - 更新短信渠道
DELETE /system/sms/channel/:id      - 删除短信渠道
GET    /system/sms/channel/list     - 获取渠道列表
GET    /system/sms/channel/:id      - 获取渠道详情

POST   /system/sms/template         - 创建短信模板
PUT    /system/sms/template/:id     - 更新短信模板
DELETE /system/sms/template/:id     - 删除短信模板
GET    /system/sms/template/list    - 获取模板列表
GET    /system/sms/template/:id     - 获取模板详情

POST   /system/sms/send             - 发送短信
GET    /system/sms/log/list         - 获取发送日志
```

### 邮件管理接口
```
POST   /system/mail/account         - 创建邮箱账号
PUT    /system/mail/account/:id     - 更新邮箱账号
DELETE /system/mail/account/:id     - 删除邮箱账号
GET    /system/mail/account/list    - 获取账号列表

POST   /system/mail/template        - 创建邮件模板
PUT    /system/mail/template/:id    - 更新邮件模板
DELETE /system/mail/template/:id    - 删除邮件模板
GET    /system/mail/template/list   - 获取模板列表

POST   /system/mail/send            - 发送邮件
GET    /system/mail/log/list        - 获取发送日志
```

### 站内信管理接口
```
POST   /system/notify/template      - 创建站内信模板
PUT    /system/notify/template/:id  - 更新站内信模板
DELETE /system/notify/template/:id  - 删除站内信模板
GET    /system/notify/template/list - 获取模板列表

POST   /system/notify/message/send  - 发送站内信
GET    /system/notify/message/list  - 获取消息列表
PUT    /system/notify/message/read  - 标记已读
GET    /system/notify/message/unread-count - 获取未读数量
```

### 租户增强接口
```
GET    /system/tenant/dashboard/stats      - 获取统计数据
GET    /system/tenant/dashboard/trend      - 获取趋势数据
GET    /system/tenant/dashboard/expiring   - 获取即将到期租户
GET    /system/tenant/dashboard/quota-top  - 获取配额使用TOP

GET    /system/tenant/quota/list           - 获取配额列表
PUT    /system/tenant/quota/:tenantId      - 更新配额
GET    /system/tenant/quota/log            - 获取配额变更记录

GET    /system/tenant/audit/list           - 获取审计日志
GET    /system/tenant/audit/export         - 导出审计日志
```

## 权限配置

### 菜单权限 (Menu IDs: 2000-2231)

| 模块 | 菜单ID | 权限标识 |
|------|--------|----------|
| 短信管理 | 2000 | - |
| 短信渠道 | 2001 | system:sms:channel:list |
| 短信模板 | 2002 | system:sms:template:list |
| 短信日志 | 2003 | system:sms:log:list |
| 站内信管理 | 2100 | - |
| 站内信模板 | 2101 | system:notify:template:list |
| 站内信消息 | 2102 | system:notify:message:list |
| 租户增强 | 2200 | - |
| 租户仪表盘 | 2201 | system:tenant:dashboard:list |
| 租户配额 | 2202 | system:tenant:quota:list |
| 租户审计 | 2203 | system:tenant:audit:list |

## 种子数据

### 运行种子数据

```bash
# 运行菜单种子数据
npx ts-node server/prisma/seeds/tenant-management-enhancement-menu.seed.ts

# 运行示例数据种子
npx ts-node server/prisma/seeds/tenant-management-enhancement-data.seed.ts
```

### 示例数据说明

#### 短信渠道示例
- 阿里云短信 (code: aliyun) - 启用状态
- 腾讯云短信 (code: tencent) - 停用状态

#### 短信模板示例
- 验证码短信 (code: sms_verification_code)
- 订单通知短信 (code: sms_order_notify)

#### 邮件模板示例
- 欢迎邮件 (code: mail_welcome)
- 密码重置邮件 (code: mail_password_reset)

#### 站内信模板示例
- 系统公告通知 (code: notify_system_announcement)
- 审批通知 (code: notify_approval)
- 配额预警通知 (code: notify_quota_warning)

## 配置说明

### 短信渠道配置

使用前需要在短信渠道中配置真实的API密钥：

```typescript
// 阿里云短信配置
{
  code: 'aliyun',
  apiKey: 'your-aliyun-access-key-id',
  apiSecret: 'your-aliyun-access-key-secret',
  signature: '【您的签名】'
}

// 腾讯云短信配置
{
  code: 'tencent',
  apiKey: 'your-tencent-secret-id',
  apiSecret: 'your-tencent-secret-key',
  signature: '【您的签名】'
}
```

### 邮箱账号配置

```typescript
{
  mail: 'noreply@yourdomain.com',
  username: 'noreply@yourdomain.com',
  password: 'your-smtp-password',
  host: 'smtp.yourdomain.com',
  port: 465,
  sslEnable: true
}
```

## 状态码说明

### 通用状态 (status)
- `'0'` - 正常/启用
- `'1'` - 停用/禁用

### 短信发送状态 (sendStatus)
- `0` - 发送中
- `1` - 发送成功
- `2` - 发送失败

### 短信模板类型 (type)
- `1` - 验证码
- `2` - 通知
- `3` - 营销

### 站内信模板类型 (type)
- `1` - 系统通知
- `2` - 业务通知

### 审计操作类型 (actionType)
- `login` - 登录
- `logout` - 登出
- `create` - 创建
- `update` - 更新
- `delete` - 删除
- `permission_change` - 权限变更
- `config_change` - 配置变更
- `export` - 导出

## 测试

### 单元测试
```bash
npm run test:unit
```

### 集成测试
```bash
npm run test:integration
```

### 属性测试
```bash
npm run test:pbt
```

## 注意事项

1. 短信和邮件的API密钥应使用加密存储
2. 生产环境需要配置真实的第三方服务凭证
3. 审计日志会记录敏感操作，注意数据安全
4. 配额管理需要定期清理历史数据
5. 站内信消息支持多租户隔离，确保数据安全
