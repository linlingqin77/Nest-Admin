import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from 'src/config/app-config.service';
import { PostgresqlConfig } from 'src/config/types';
import { createSlowQueryExtension, DEFAULT_SLOW_QUERY_THRESHOLD, SlowQueryLog } from './slow-query.extension';
import { createTenantExtension } from 'src/tenant/extensions/tenant.extension';

/**
 * 扩展后的 Prisma 客户端类型
 */
type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

/**
 * 创建扩展后的 Prisma 客户端
 */
function createExtendedPrismaClient(connectionString: string, slowQueryLogs: SlowQueryLog[]) {
  const baseClient = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  // 使用 $extends 链式扩展替代已弃用的 $use 中间件
  return baseClient.$extends(createTenantExtension()).$extends(
    createSlowQueryExtension(
      {
        threshold: DEFAULT_SLOW_QUERY_THRESHOLD,
        enabled: true,
      },
      (log) => {
        // 存储慢查询日志用于监控和分析
        slowQueryLogs.push(log);
        // 保持最近 100 条慢查询记录
        if (slowQueryLogs.length > 100) {
          slowQueryLogs.shift();
        }
      },
    ),
  );
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryLogs: SlowQueryLog[] = [];
  private readonly _client: ExtendedPrismaClient;

  constructor(config: AppConfigService) {
    const pgConfig = config.db.postgresql;
    if (!pgConfig) {
      throw new Error('PostgreSQL configuration (db.postgresql) is missing.');
    }

    const connectionString = PrismaService.buildConnectionString(pgConfig);
    this._client = createExtendedPrismaClient(connectionString, this.slowQueryLogs);
  }

  /**
   * 获取扩展后的 Prisma 客户端
   * 用于直接访问所有 Prisma 模型和方法
   */
  get client(): ExtendedPrismaClient {
    return this._client;
  }

  // ============ 代理所有 Prisma 模型访问 ============
  get sysUser() {
    return this._client.sysUser;
  }
  get sysRole() {
    return this._client.sysRole;
  }
  get sysDept() {
    return this._client.sysDept;
  }
  get sysMenu() {
    return this._client.sysMenu;
  }
  get sysPost() {
    return this._client.sysPost;
  }
  get sysConfig() {
    return this._client.sysConfig;
  }
  get sysDictType() {
    return this._client.sysDictType;
  }
  get sysDictData() {
    return this._client.sysDictData;
  }
  get sysNotice() {
    return this._client.sysNotice;
  }
  get sysOperLog() {
    return this._client.sysOperLog;
  }
  get sysLogininfor() {
    return this._client.sysLogininfor;
  }
  get sysJob() {
    return this._client.sysJob;
  }
  get sysJobLog() {
    return this._client.sysJobLog;
  }
  get sysUpload() {
    return this._client.sysUpload;
  }
  get sysFileFolder() {
    return this._client.sysFileFolder;
  }
  get sysFileShare() {
    return this._client.sysFileShare;
  }
  get sysTenant() {
    return this._client.sysTenant;
  }
  get sysTenantPackage() {
    return this._client.sysTenantPackage;
  }
  get sysTenantFeature() {
    return this._client.sysTenantFeature;
  }
  get sysTenantUsage() {
    return this._client.sysTenantUsage;
  }
  get sysUserRole() {
    return this._client.sysUserRole;
  }
  get sysUserPost() {
    return this._client.sysUserPost;
  }
  get sysRoleMenu() {
    return this._client.sysRoleMenu;
  }
  get sysRoleDept() {
    return this._client.sysRoleDept;
  }
  get sysAuditLog() {
    return this._client.sysAuditLog;
  }
  get sysClient() {
    return this._client.sysClient;
  }
  get sysOss() {
    return this._client.sysOss;
  }
  get sysOssConfig() {
    return this._client.sysOssConfig;
  }
  get genTable() {
    return this._client.genTable;
  }
  get genTableColumn() {
    return this._client.genTableColumn;
  }
  get sysMailAccount() {
    return this._client.sysMailAccount;
  }
  get sysMailTemplate() {
    return this._client.sysMailTemplate;
  }
  get sysMailLog() {
    return this._client.sysMailLog;
  }
  get sysSmsChannel() {
    return this._client.sysSmsChannel;
  }
  get sysSmsTemplate() {
    return this._client.sysSmsTemplate;
  }
  get sysSmsLog() {
    return this._client.sysSmsLog;
  }
  get sysNotifyTemplate() {
    return this._client.sysNotifyTemplate;
  }
  get sysNotifyMessage() {
    return this._client.sysNotifyMessage;
  }
  get sysTenantAuditLog() {
    return this._client.sysTenantAuditLog;
  }
  get sysTenantQuotaLog() {
    return this._client.sysTenantQuotaLog;
  }
  get genDataSource() {
    return this._client.genDataSource;
  }
  get genTemplateGroup() {
    return this._client.genTemplateGroup;
  }
  get genTemplate() {
    return this._client.genTemplate;
  }
  get genHistory() {
    return this._client.genHistory;
  }

  // ============ 代理 Prisma 核心方法 ============
  /**
   * 连接数据库
   */
  $connect() {
    return this._client.$connect();
  }

  /**
   * 断开数据库连接
   */
  $disconnect() {
    return this._client.$disconnect();
  }

  /**
   * 执行事务
   */
  $transaction<T>(
    fn: (prisma: ExtendedPrismaClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: any },
  ): Promise<T>;
  $transaction<T>(queries: any[], options?: { isolationLevel?: any }): Promise<any[]>;
  $transaction<T>(
    fnOrQueries: ((prisma: ExtendedPrismaClient) => Promise<T>) | any[],
    options?: any,
  ): Promise<T | any[]> {
    if (typeof fnOrQueries === 'function') {
      return this._client.$transaction(fnOrQueries as any, options);
    }
    return this._client.$transaction(fnOrQueries, options);
  }

  /**
   * 执行原始 SQL 查询
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | any, ...values: any[]): Promise<T> {
    return this._client.$queryRaw(query, ...values) as Promise<T>;
  }

  /**
   * 执行原始 SQL 命令
   */
  $executeRaw(query: TemplateStringsArray | any, ...values: any[]): Promise<number> {
    return this._client.$executeRaw(query, ...values);
  }

  /**
   * 执行原始 SQL 命令（不安全版本）
   */
  $executeRawUnsafe(query: string, ...values: any[]): Promise<number> {
    return this._client.$executeRawUnsafe(query, ...values);
  }

  /**
   * 执行原始 SQL 查询（不安全版本）
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Promise<T> {
    return this._client.$queryRawUnsafe(query, ...values) as Promise<T>;
  }

  /**
   * 获取最近的慢查询日志
   * @param limit 返回的日志数量，默认 10
   */
  getSlowQueryLogs(limit: number = 10): SlowQueryLog[] {
    return this.slowQueryLogs.slice(-limit);
  }

  /**
   * 清除慢查询日志
   */
  clearSlowQueryLogs(): void {
    this.slowQueryLogs.length = 0;
  }

  private static buildConnectionString(config: PostgresqlConfig): string {
    const { username, password, host, port, database, schema, ssl } = config;
    const encodedUser = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password ?? '');
    const credentials = password ? `${encodedUser}:${encodedPassword}` : encodedUser;
    const params = new URLSearchParams();

    if (schema) {
      params.set('schema', schema);
    }

    if (ssl) {
      params.set('sslmode', 'require');
    }

    const query = params.toString();
    return `postgresql://${credentials}@${host}:${port}/${database}${query ? `?${query}` : ''}`;
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to PostgreSQL successfully.');
  }

  /**
   * 模块销毁时关闭 Prisma 连接 (需求 3.8)
   * 确保优雅关闭时正确清理数据库连接
   */
  async onModuleDestroy() {
    this.logger.log('Closing Prisma connection...');
    try {
      await this.$disconnect();
      this.logger.log('Prisma connection closed successfully.');
    } catch (error) {
      this.logger.error(`Error closing Prisma connection: ${error.message}`);
      throw error;
    }
  }
}
