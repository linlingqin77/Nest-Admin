# Nest-Admin-Soybean 未来改进计划与路线图

> 📅 文档创建时间：2025年12月  
> 🎯 目标：打造功能完善、性能卓越的 Node.js 企业级后台管理系统

---

## 📊 当前版本功能概览 (v2.0.0)

### 已实现功能
- ✅ 用户管理、角色管理、菜单管理、部门管理
- ✅ 字典管理、参数配置、通知公告
- ✅ 操作日志、登录日志、在线用户
- ✅ 定时任务管理
- ✅ 代码生成器（基础版）
- ✅ 文件上传（本地 + 腾讯云 COS）
- ✅ 数据权限控制
- ✅ JWT 认证 + Redis 缓存
- ✅ Swagger API 文档

---

## 🚀 短期计划 (v2.1.0 - v2.3.0)

### 1. 基础功能增强

#### 1.1 认证授权增强
```
预计版本: v2.1.0
优先级: 🔴 高
```

| 功能 | 描述 | 参考项目 |
|------|------|----------|
| OAuth2.0 社交登录 | 支持 GitHub、Google、微信、QQ、钉钉等第三方登录 | NextAuth.js, Passport.js |
| 双因素认证 (2FA) | TOTP 动态口令、短信验证码、邮箱验证 | Speakeasy, OTPLib |
| 单点登录 (SSO) | 支持 CAS、SAML、OIDC 协议 | Casdoor, Keycloak |
| 设备管理 | 登录设备绑定、异地登录提醒、设备踢下线 | - |
| 密码策略 | 密码强度校验、定期更换提醒、历史密码检查 | - |
| 登录安全 | 滑块验证码、行为验证、登录失败锁定 | AJ-Captcha |

**实现方案：**
```typescript
// 社交登录模块结构
src/module/system/social/
├── social.module.ts
├── social.controller.ts
├── social.service.ts
├── strategies/
│   ├── github.strategy.ts
│   ├── google.strategy.ts
│   ├── wechat.strategy.ts
│   └── dingtalk.strategy.ts
└── dto/
    └── social-bindding.dto.ts
```

#### 1.2 数据权限增强
```
预计版本: v2.1.0
优先级: 🔴 高
```

| 功能 | 描述 |
|------|------|
| 字段级权限 | 控制用户可查看/编辑的字段 |
| 行级权限规则 | 支持自定义 SQL 表达式的数据过滤 |
| 权限继承 | 子部门/子角色自动继承父级权限 |
| 临时授权 | 支持时效性权限授予 |
| 权限模拟 | 管理员可模拟其他用户权限视角 |

**数据库设计：**
```sql
-- 字段权限表
CREATE TABLE sys_field_permission (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  permission_type VARCHAR(20), -- 'visible', 'editable', 'hidden'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 数据规则表
CREATE TABLE sys_data_rule (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  rule_name VARCHAR(100),
  rule_column VARCHAR(100),
  rule_operator VARCHAR(20), -- 'eq', 'ne', 'in', 'like', 'between'
  rule_value TEXT,
  status CHAR(1) DEFAULT '0'
);
```

#### 1.3 API 管理增强
```
预计版本: v2.2.0
优先级: 🟡 中
```

| 功能 | 描述 | 参考项目 |
|------|------|----------|
| API 版本管理 | 支持 v1/v2 多版本 API 共存 | NestJS Versioning |
| API 限流增强 | 基于用户/IP/接口的细粒度限流 | Throttler |
| API 熔断降级 | 服务不可用时的优雅降级 | Hystrix |
| API Mock | 开发阶段的接口模拟 | Mock.js |
| GraphQL 支持 | 可选的 GraphQL 查询层 | Apollo Server |
| API 网关 | 统一的 API 入口和路由 | Kong, APISIX |

---

### 2. 监控运维增强

#### 2.1 系统监控
```
预计版本: v2.2.0
优先级: 🔴 高
```

| 功能 | 描述 | 技术方案 |
|------|------|----------|
| 服务健康检查 | 应用存活/就绪探针 | @nestjs/terminus |
| 性能指标监控 | CPU、内存、请求延迟、QPS | Prometheus + Grafana |
| 链路追踪 | 分布式请求追踪 | Jaeger, OpenTelemetry |
| 错误追踪 | 异常捕获与上报 | Sentry |
| 实时日志 | 日志聚合与搜索 | ELK Stack |
| 数据库监控 | 慢查询分析、连接池状态 | pg_stat_statements |

**健康检查实现：**
```typescript
// src/module/monitor/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private redis: RedisHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.9, path: '/' }),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
```

#### 2.2 审计日志增强
```
预计版本: v2.2.0
优先级: 🟡 中
```

| 功能 | 描述 |
|------|------|
| 数据变更追踪 | 记录数据修改前后的完整内容 |
| 敏感操作审计 | 权限变更、数据导出等关键操作 |
| 审计报表 | 操作统计、趋势分析、异常检测 |
| 审计归档 | 历史日志自动归档与清理 |
| 审计导出 | 支持导出审计报告 (PDF/Excel) |

**审计拦截器：**
```typescript
// src/common/interceptor/audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const beforeData = this.captureBeforeState(request);
    
    return next.handle().pipe(
      tap((response) => {
        this.recordAuditLog({
          userId: request.user?.userId,
          action: this.getAction(request.method),
          resource: request.path,
          beforeData,
          afterData: response?.data,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }
}
```

---

### 3. 消息通知系统

#### 3.1 站内消息
```
预计版本: v2.3.0
优先级: 🟡 中
```

| 功能 | 描述 |
|------|------|
| 系统通知 | 管理员发布的系统公告 |
| 个人消息 | 用户间的私信功能 |
| 消息模板 | 可配置的消息模板 |
| 消息订阅 | 用户可订阅感兴趣的消息类型 |
| 已读/未读 | 消息状态管理 |
| 消息推送 | WebSocket 实时推送 |

**数据库设计：**
```sql
-- 消息模板表
CREATE TABLE sys_message_template (
  id SERIAL PRIMARY KEY,
  template_code VARCHAR(100) UNIQUE NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_content TEXT NOT NULL,
  template_type VARCHAR(20), -- 'system', 'notify', 'private'
  template_params JSON, -- 模板参数定义
  status CHAR(1) DEFAULT '0'
);

-- 消息表
CREATE TABLE sys_message (
  id SERIAL PRIMARY KEY,
  template_id INT,
  sender_id INT,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  message_type VARCHAR(20),
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户消息关联表
CREATE TABLE sys_user_message (
  id SERIAL PRIMARY KEY,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

#### 3.2 外部通知渠道
```
预计版本: v2.3.0
优先级: 🟡 中
```

| 渠道 | 描述 | 技术方案 |
|------|------|----------|
| 邮件通知 | SMTP 邮件发送 | Nodemailer |
| 短信通知 | 阿里云/腾讯云短信 | 官方 SDK |
| 微信通知 | 公众号模板消息、企业微信 | WeChat SDK |
| 钉钉通知 | 工作通知、机器人 | DingTalk SDK |
| 飞书通知 | 消息卡片 | Lark SDK |
| Webhook | 自定义 HTTP 回调 | Axios |
| App 推送 | iOS/Android 推送 | JPush, Firebase |

**统一通知服务：**
```typescript
// src/module/notification/notification.service.ts
@Injectable()
export class NotificationService {
  async send(notification: NotificationDto) {
    const channels = await this.getEnabledChannels(notification.type);
    
    const results = await Promise.allSettled(
      channels.map(channel => this.sendByChannel(channel, notification))
    );
    
    await this.recordNotificationLog(notification, results);
    return results;
  }
  
  private async sendByChannel(channel: string, notification: NotificationDto) {
    const strategy = this.channelStrategies.get(channel);
    if (!strategy) {
      throw new Error(`Unknown channel: ${channel}`);
    }
    return strategy.send(notification);
  }
}
```

---

## 🎯 中期计划 (v3.0.0 - v3.5.0)

### 4. 多租户架构 ✅ 已完成

#### 4.1 租户管理
```
版本: v2.1.0 (已完成)
状态: ✅ 完成
```

| 功能 | 描述 | 状态 |
|------|------|------|
| 租户管理 | 租户 CRUD、状态管理、套餐管理 | ✅ |
| 租户隔离 | 行级隔离（共享数据库，共享 Schema） | ✅ |
| 租户配置 | 每个租户独立的系统配置 | ✅ |
| 租户计费 | 用量统计、套餐限制、配额管理 | ✅ |
| 功能开关 | 租户级别的功能开关控制 | ✅ |
| 租户生命周期 | 创建、初始化、状态变更、禁用 | ✅ |

**已实现的核心组件：**

| 组件 | 位置 | 功能 |
|------|------|------|
| TenantContext | `src/tenant/context/` | AsyncLocalStorage 实现的租户上下文 |
| TenantHttpMiddleware | `src/tenant/middleware/` | HTTP 请求租户识别中间件 |
| Prisma Tenant Middleware | `src/tenant/middleware/` | 数据层自动租户过滤 |
| TenantLifecycleService | `src/tenant/services/` | 租户生命周期管理 |
| FeatureToggleService | `src/tenant/services/` | 功能开关服务 |
| TenantQuotaService | `src/tenant/services/` | 配额管理服务 |
| RelationValidationService | `src/tenant/services/` | 应用层关联验证（无外键） |
| RequireFeatureGuard | `src/tenant/guards/` | 功能开关守卫 |
| RequireQuotaGuard | `src/tenant/guards/` | 配额检查守卫 |
| Tenant Exceptions | `src/tenant/exceptions/` | 租户相关异常类 |
| Cache Keys | `src/tenant/constants/` | 租户缓存键生成函数 |

**架构特点：**
- 遵循阿里开发规范，不使用数据库外键
- 使用 AsyncLocalStorage 实现异步上下文传递
- 支持 `runWithTenant()` 临时切换租户
- 支持 `runIgnoringTenant()` 跨租户操作
- 支持请求ID链路追踪
- 完整的类型定义和异常处理

---

### 5. 工作流引擎

#### 5.1 流程设计器
```
预计版本: v3.1.0
优先级: 🔴 高
参考项目: Flowable, Activiti, Camunda
```

| 功能 | 描述 |
|------|------|
| 可视化设计 | 拖拽式流程设计器 (BPMN 2.0) |
| 流程模板 | 预置常用流程模板 |
| 表单设计 | 流程关联的动态表单 |
| 流程版本 | 流程定义的版本管理 |
| 流程导入导出 | 支持 BPMN XML 导入导出 |

**前端推荐：**
- bpmn.js - BPMN 流程设计器
- form-create - 动态表单生成

#### 5.2 流程运行时
```
预计版本: v3.2.0
优先级: 🔴 高
```

| 功能 | 描述 |
|------|------|
| 流程发起 | 启动流程实例 |
| 任务办理 | 审批、驳回、转办、委托、加签 |
| 流程跟踪 | 流程进度、审批记录、流程图高亮 |
| 催办/撤回 | 流程催办提醒、申请人撤回 |
| 条件分支 | 基于表达式的条件路由 |
| 并行会签 | 多人同时审批 |
| 串行审批 | 按顺序逐个审批 |
| 定时任务 | 超时自动处理 |
| 消息事件 | 流程事件通知 |

**流程引擎核心：**
```typescript
// src/module/workflow/engine/workflow.engine.ts
@Injectable()
export class WorkflowEngine {
  // 启动流程
  async startProcess(processKey: string, variables: Record<string, any>) {}
  
  // 完成任务
  async completeTask(taskId: string, variables: Record<string, any>) {}
  
  // 驳回任务
  async rejectTask(taskId: string, targetNodeId: string, comment: string) {}
  
  // 转办任务
  async transferTask(taskId: string, toUserId: string) {}
  
  // 委托任务
  async delegateTask(taskId: string, toUserId: string) {}
  
  // 加签
  async addSign(taskId: string, userIds: string[], type: 'before' | 'after') {}
  
  // 获取流程图 (高亮当前节点)
  async getProcessDiagram(processInstanceId: string) {}
  
  // 获取审批记录
  async getAuditHistory(processInstanceId: string) {}
}
```

**数据库设计：**
```sql
-- 流程定义表
CREATE TABLE wf_process_definition (
  id VARCHAR(64) PRIMARY KEY,
  process_key VARCHAR(100) NOT NULL,
  process_name VARCHAR(200) NOT NULL,
  version INT DEFAULT 1,
  bpmn_xml TEXT,
  form_id VARCHAR(64),
  status CHAR(1) DEFAULT '0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 流程实例表
CREATE TABLE wf_process_instance (
  id VARCHAR(64) PRIMARY KEY,
  process_definition_id VARCHAR(64) NOT NULL,
  business_key VARCHAR(100),
  start_user_id INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20), -- 'running', 'completed', 'canceled', 'suspended'
  variables JSON
);

-- 任务表
CREATE TABLE wf_task (
  id VARCHAR(64) PRIMARY KEY,
  process_instance_id VARCHAR(64) NOT NULL,
  node_id VARCHAR(100),
  node_name VARCHAR(200),
  assignee_id INT,
  candidate_users JSON,
  candidate_groups JSON,
  task_type VARCHAR(20), -- 'userTask', 'serviceTask'
  status VARCHAR(20), -- 'pending', 'completed', 'canceled'
  created_at TIMESTAMP,
  completed_at TIMESTAMP,
  due_date TIMESTAMP,
  comment TEXT
);

-- 审批记录表
CREATE TABLE wf_audit_record (
  id SERIAL PRIMARY KEY,
  process_instance_id VARCHAR(64),
  task_id VARCHAR(64),
  user_id INT,
  action VARCHAR(20), -- 'approve', 'reject', 'transfer', 'delegate'
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6. 代码生成器增强

#### 6.1 模板增强
```
预计版本: v3.3.0
优先级: 🟡 中
```

| 功能 | 描述 |
|------|------|
| 多模板支持 | 单表、树表、主子表、左树右表 |
| 自定义模板 | 支持用户自定义代码模板 |
| 模板变量 | 丰富的模板变量和函数 |
| 模板预览 | 生成前预览代码效果 |
| 增量生成 | 只生成变更的部分，保留自定义代码 |
| 多端生成 | 同时生成前端 (Vue/React) + 后端代码 |

**支持的模板类型：**

```
模板类型
├── 单表 CRUD (基础)
├── 树形表 (部门、分类)
├── 主子表 (订单-订单明细)
├── 左树右表 (分类树 + 数据列表)
├── 关联表 (多对多关系)
├── 导入导出模板
├── 报表查询模板
└── 自定义模板
```

#### 6.2 智能生成
```
预计版本: v3.3.0
优先级: 🟢 低
```

| 功能 | 描述 |
|------|------|
| 字段类型推断 | 根据字段名自动推断类型和组件 |
| 字典自动关联 | 自动识别并关联字典类型 |
| 验证规则生成 | 根据数据库约束生成验证规则 |
| 接口文档生成 | 自动生成 API 文档 |
| AI 辅助 | 基于 AI 的智能代码补全 (可选) |

---

### 7. 报表与数据可视化

#### 7.1 报表中心
```
预计版本: v3.4.0
优先级: 🟡 中
参考项目: JimuReport, UReport2
```

| 功能 | 描述 |
|------|------|
| 报表设计器 | 可视化报表设计 |
| 数据源管理 | 多数据源支持 |
| 报表模板 | 常用报表模板库 |
| 报表导出 | PDF、Excel、图片导出 |
| 定时报表 | 定时生成并推送报表 |
| 报表权限 | 基于角色的报表访问控制 |

#### 7.2 数据大屏
```
预计版本: v3.4.0
优先级: 🟢 低
参考项目: DataV, GoView
```

| 功能 | 描述 |
|------|------|
| 大屏设计器 | 拖拽式大屏设计 |
| 图表组件 | 丰富的 ECharts 图表组件 |
| 实时数据 | WebSocket 数据实时更新 |
| 自适应布局 | 多分辨率自适应 |
| 主题切换 | 多套大屏主题 |

---

### 8. 文件服务增强

#### 8.1 文件管理
```
预计版本: v3.5.0
优先级: 🟡 中
```

| 功能 | 描述 |
|------|------|
| 文件分类 | 按类型、业务模块分类管理 |
| 文件预览 | Office、PDF、图片、视频在线预览 |
| 文件版本 | 文件历史版本管理 |
| 回收站 | 已删除文件恢复 |
| 存储空间 | 用户/租户存储配额管理 |
| 文件搜索 | 全文搜索文件内容 |

#### 8.2 多存储支持
```
预计版本: v3.5.0
优先级: 🟡 中
```

| 存储类型 | 描述 |
|----------|------|
| 本地存储 | 本地文件系统 |
| MinIO | 私有化对象存储 |
| 阿里云 OSS | 阿里云对象存储 |
| 腾讯云 COS | 腾讯云对象存储 (已支持) |
| 七牛云 | 七牛云存储 |
| AWS S3 | Amazon S3 |
| 华为云 OBS | 华为云对象存储 |

**统一存储接口：**
```typescript
// src/module/upload/storage/storage.interface.ts
export interface IStorageStrategy {
  upload(file: Express.Multer.File, path: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string, expires?: number): Promise<string>;
  getSignedUploadUrl(key: string, contentType: string): Promise<SignedUrlResult>;
}

// 存储工厂
@Injectable()
export class StorageFactory {
  private strategies = new Map<string, IStorageStrategy>();
  
  register(type: string, strategy: IStorageStrategy) {
    this.strategies.set(type, strategy);
  }
  
  getStrategy(type?: string): IStorageStrategy {
    const storageType = type || this.configService.get('storage.default');
    const strategy = this.strategies.get(storageType);
    if (!strategy) {
      throw new Error(`Storage strategy '${storageType}' not found`);
    }
    return strategy;
  }
}
```

---

## 🌟 长期计划 (v4.0.0+)

### 9. 微服务架构

#### 9.1 服务拆分
```
预计版本: v4.0.0
优先级: 🟢 低
```

| 服务 | 描述 |
|------|------|
| gateway-service | API 网关服务 |
| auth-service | 认证授权服务 |
| user-service | 用户中心服务 |
| system-service | 系统管理服务 |
| file-service | 文件服务 |
| message-service | 消息通知服务 |
| workflow-service | 工作流服务 |
| report-service | 报表服务 |
| job-service | 定时任务服务 |

**技术选型：**

| 组件 | 推荐方案 |
|------|----------|
| 服务注册 | Consul / Nacos |
| 配置中心 | Nacos / Apollo |
| API 网关 | Kong / APISIX |
| 服务通信 | gRPC / HTTP |
| 消息队列 | RabbitMQ / Kafka |
| 分布式事务 | Saga 模式 |
| 链路追踪 | Jaeger / Zipkin |

#### 9.2 容器化部署
```
预计版本: v4.0.0
优先级: 🟡 中
```

| 功能 | 描述 |
|------|------|
| Docker 镜像 | 官方 Docker 镜像 |
| Docker Compose | 一键部署脚本 |
| Kubernetes | K8s 部署配置 |
| Helm Charts | Helm 包管理 |
| CI/CD | GitHub Actions / GitLab CI |

**Docker Compose 示例：**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/nest_admin
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
      
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: nest_admin
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

### 10. 低代码平台

#### 10.1 表单设计器
```
预计版本: v4.1.0
优先级: 🟢 低
参考项目: FormMaking, form-generator, Amis
```

| 功能 | 描述 |
|------|------|
| 拖拽设计 | 可视化表单设计 |
| 组件库 | 丰富的表单组件 |
| 表单联动 | 字段间的联动逻辑 |
| 表单验证 | 自定义验证规则 |
| 表单模板 | 表单模板复用 |

#### 10.2 页面设计器
```
预计版本: v4.2.0
优先级: 🟢 低
参考项目: LowCodeEngine, PagePlug, Appsmith
```

| 功能 | 描述 |
|------|------|
| 页面搭建 | 可视化页面搭建 |
| 组件市场 | 可复用的业务组件 |
| 数据绑定 | API 数据绑定 |
| 事件绑定 | 组件事件处理 |
| 主题定制 | 页面主题样式 |

---

### 11. AI 能力集成

#### 11.1 智能助手
```
预计版本: v4.3.0
优先级: 🟢 低
```

| 功能 | 描述 |
|------|------|
| AI 对话 | 集成 ChatGPT / Claude API |
| 智能问答 | 基于知识库的智能问答 |
| 代码助手 | AI 辅助代码编写 |
| 数据分析 | AI 驱动的数据分析建议 |
| 智能提醒 | 基于 AI 的异常检测和提醒 |

#### 11.2 内容生成
```
预计版本: v4.3.0
优先级: 🟢 低
```

| 功能 | 描述 |
|------|------|
| 文案生成 | 通知、公告内容生成 |
| 报告生成 | 自动生成分析报告 |
| 翻译服务 | 多语言内容翻译 |

---

## 📋 技术债务清理

### 代码质量提升
```
持续进行
优先级: 🟡 中
```

| 项目 | 描述 |
|------|------|
| 单元测试 | 核心模块测试覆盖率 > 80% |
| E2E 测试 | 关键流程端到端测试 |
| 代码规范 | ESLint + Prettier 统一规范 |
| 类型安全 | 消除 any 类型，完善类型定义 |
| 错误处理 | 统一错误码和异常处理 |
| 日志规范 | 结构化日志输出 |
| 性能优化 | 数据库查询优化、缓存策略 |
| 安全加固 | OWASP Top 10 安全检查 |

### 文档完善
```
持续进行
优先级: 🟡 中
```

| 文档 | 描述 |
|------|------|
| 接口文档 | OpenAPI/Swagger 完善 |
| 部署文档 | Docker、K8s 部署指南 |
| 开发文档 | 架构说明、开发规范 |
| 使用手册 | 功能使用说明 |
| 视频教程 | 关键功能视频教程 |
| 变更日志 | 版本更新记录 |

---

## 🗓️ 版本发布计划

| 版本 | 预计时间 | 主要功能 | 状态 |
|------|----------|----------|------|
| v2.1.0 | 2025 Q1 | 多租户架构重构、OAuth2 社交登录、数据权限增强 | ✅ 已完成 |
| v2.2.0 | 2025 Q1 | 系统监控、审计日志增强 | 🔄 进行中 |
| v2.3.0 | 2025 Q2 | 消息通知系统 | 📋 计划中 |
| v3.0.0 | 2025 Q2 | 工作流引擎 (设计器) | 📋 计划中 |
| v3.1.0 | 2025 Q3 | 工作流引擎 (运行时) | 📋 计划中 |
| v3.2.0 | 2025 Q3 | 代码生成器增强 | 📋 计划中 |
| v3.3.0 | 2025 Q4 | 报表与数据可视化 | 📋 计划中 |
| v3.4.0 | 2025 Q4 | 文件服务增强 | 📋 计划中 |
| v4.0.0 | 2026 Q1 | 微服务架构 | 📋 计划中 |
| v4.1.0 | 2026 Q2 | 低代码-表单设计器 | 📋 计划中 |
| v4.2.0 | 2026 Q3 | 低代码-页面设计器 | 📋 计划中 |
| v4.3.0 | 2026 Q4 | AI 能力集成 | 📋 计划中 |

---

## 🤝 参考项目

| 项目 | 技术栈 | 参考价值 |
|------|--------|----------|
| [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro) | Java + Spring Boot | 功能全面、架构设计 |
| [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) | Vue3 + TypeScript | 前端架构、组件设计 |
| [Ant Design Pro](https://github.com/ant-design/ant-design-pro) | React + TypeScript | 前端最佳实践 |
| [NestJS](https://github.com/nestjs/nest) | Node.js + TypeScript | 后端架构模式 |
| [Midway](https://github.com/midwayjs/midway) | Node.js + TypeScript | 企业级 Node 框架 |
| [Cool Admin](https://github.com/cool-team-official/cool-admin-midway) | Midway + Vue | Node 后台方案 |
| [Casdoor](https://github.com/casdoor/casdoor) | Go | 身份认证方案 |
| [Flowable](https://github.com/flowable/flowable-engine) | Java | 工作流引擎 |
| [bpmn.js](https://github.com/bpmn-io/bpmn-js) | JavaScript | 流程设计器 |
| [JimuReport](https://github.com/jeecgboot/JimuReport) | Java | 报表设计器 |
| [GoView](https://github.com/dromara/go-view) | Vue3 | 数据大屏 |
| [Amis](https://github.com/baidu/amis) | React | 低代码框架 |
| [LowCodeEngine](https://github.com/alibaba/lowcode-engine) | React | 低代码引擎 |

---

## 📢 社区贡献

欢迎社区贡献者参与项目开发！

### 如何贡献
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 贡献方向
- 🐛 Bug 修复
- ✨ 新功能开发
- 📝 文档完善
- 🌐 国际化翻译
- 🎨 UI/UX 优化
- ⚡ 性能优化
- 🧪 测试用例

---

> 📌 **注意：** 本路线图会根据实际开发进度和社区反馈进行调整，具体发布时间以实际为准。

---

*最后更新：2026年1月*
