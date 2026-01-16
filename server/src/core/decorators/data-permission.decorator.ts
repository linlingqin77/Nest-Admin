import {
  SetMetadata,
  applyDecorators,
  UseInterceptors,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';

export const DATA_PERMISSION_KEY = 'DATA_PERMISSION';
export const DATA_PERMISSION_CONTEXT_KEY = 'DATA_PERMISSION_CONTEXT';

/**
 * 数据权限范围枚举
 */
export enum DataScope {
  /** 全部数据 */
  ALL = 1,
  /** 指定部门数据 */
  DEPT_CUSTOM = 2,
  /** 本部门数据 */
  DEPT_ONLY = 3,
  /** 本部门及以下数据 */
  DEPT_AND_CHILD = 4,
  /** 仅本人数据 */
  SELF = 5,
}

/**
 * 数据权限规则
 */
export interface DataPermissionRule {
  /** 规则名称 */
  name: string;
  /** 表别名 */
  tableAlias?: string;
  /** 部门ID字段名 */
  deptIdColumn?: string;
  /** 用户ID字段名 */
  userIdColumn?: string;
}

/**
 * 数据权限配置选项
 */
export interface DataPermissionOptions {
  /** 是否启用数据权限，默认true */
  enable?: boolean;
  /** 部门表别名 */
  deptAlias?: string;
  /** 用户表别名 */
  userAlias?: string;
  /** 部门ID字段名，默认 'deptId' */
  deptIdColumn?: string;
  /** 用户ID字段名，默认 'userId' */
  userIdColumn?: string;
  /** 包含的规则 */
  includeRules?: DataPermissionRule[];
  /** 排除的规则 */
  excludeRules?: string[];
}

/**
 * 数据权限上下文
 */
export interface DataPermissionContext {
  /** 是否启用 */
  enabled: boolean;
  /** 数据范围 */
  dataScope: DataScope;
  /** 当前用户ID */
  userId: number;
  /** 当前用户部门ID */
  deptId: number;
  /** 可访问的部门ID列表 */
  deptIds: number[];
  /** 配置选项 */
  options: DataPermissionOptions;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<Omit<DataPermissionOptions, 'includeRules' | 'excludeRules'>> &
  Pick<DataPermissionOptions, 'includeRules' | 'excludeRules'> = {
  enable: true,
  deptAlias: '',
  userAlias: '',
  deptIdColumn: 'deptId',
  userIdColumn: 'userId',
  includeRules: undefined,
  excludeRules: undefined,
};

/**
 * 数据权限装饰器
 *
 * @description
 * 用于实现基于部门的数据隔离
 * 根据用户角色的数据权限范围自动过滤数据
 *
 * @example
 * ```typescript
 * // 基本用法
 * @Get('list')
 * @DataPermission()
 * async getUserList(@Query() query: UserQueryDto) {}
 *
 * // 自定义配置
 * @Get('list')
 * @DataPermission({ deptAlias: 'u', deptIdColumn: 'dept_id' })
 * async getUserList(@Query() query: UserQueryDto) {}
 *
 * // 禁用数据权限
 * @Get('all')
 * @DataPermission({ enable: false })
 * async getAllUsers() {}
 * ```
 *
 * @param options 数据权限配置
 */
export function DataPermission(options: DataPermissionOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  return applyDecorators(SetMetadata(DATA_PERMISSION_KEY, mergedOptions), UseInterceptors(DataPermissionInterceptor));
}

/**
 * 获取数据权限上下文的参数装饰器
 */
export const GetDataPermissionContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DataPermissionContext | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as any)[DATA_PERMISSION_CONTEXT_KEY] || null;
  },
);

/**
 * 数据权限拦截器
 */
@Injectable()
export class DataPermissionInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const options = this.reflector.get<DataPermissionOptions>(DATA_PERMISSION_KEY, context.getHandler());

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    // 构建数据权限上下文
    const permissionContext = this.buildPermissionContext(user, options);

    // 将上下文附加到请求对象
    (request as any)[DATA_PERMISSION_CONTEXT_KEY] = permissionContext;

    return next.handle();
  }

  /**
   * 构建数据权限上下文
   */
  private buildPermissionContext(user: any, options: DataPermissionOptions): DataPermissionContext {
    // 如果禁用数据权限，返回全部数据范围
    if (options.enable === false) {
      return {
        enabled: false,
        dataScope: DataScope.ALL,
        userId: user?.userId || 0,
        deptId: user?.deptId || 0,
        deptIds: [],
        options,
      };
    }

    // 获取用户的数据权限范围
    const dataScope = this.getUserDataScope(user);
    const deptIds = this.getAccessibleDeptIds(user, dataScope);

    return {
      enabled: true,
      dataScope,
      userId: user?.userId || 0,
      deptId: user?.deptId || 0,
      deptIds,
      options,
    };
  }

  /**
   * 获取用户的数据权限范围
   * 从用户角色中获取最大的数据权限范围
   */
  private getUserDataScope(user: any): DataScope {
    if (!user || !user.roles) {
      return DataScope.SELF;
    }

    // 超级管理员拥有全部数据权限
    if (user.isAdmin || user.roles?.some((r: any) => r.roleKey === 'admin')) {
      return DataScope.ALL;
    }

    // 从角色中获取最大的数据权限范围
    let maxScope = DataScope.SELF;
    for (const role of user.roles || []) {
      const roleScope = role.dataScope || DataScope.SELF;
      if (roleScope < maxScope) {
        maxScope = roleScope;
      }
    }

    return maxScope;
  }

  /**
   * 获取可访问的部门ID列表
   */
  private getAccessibleDeptIds(user: any, dataScope: DataScope): number[] {
    if (!user) {
      return [];
    }

    switch (dataScope) {
      case DataScope.ALL:
        // 全部数据，不需要部门过滤
        return [];

      case DataScope.DEPT_CUSTOM:
        // 指定部门数据，从角色配置中获取
        return this.getCustomDeptIds(user);

      case DataScope.DEPT_ONLY:
        // 本部门数据
        return user.deptId ? [user.deptId] : [];

      case DataScope.DEPT_AND_CHILD:
        // 本部门及以下数据
        return this.getDeptAndChildIds(user);

      case DataScope.SELF:
        // 仅本人数据，不需要部门过滤（使用用户ID过滤）
        return [];

      default:
        return [];
    }
  }

  /**
   * 获取自定义部门ID列表
   */
  private getCustomDeptIds(user: any): number[] {
    const deptIds: Set<number> = new Set();

    for (const role of user.roles || []) {
      if (role.dataScope === DataScope.DEPT_CUSTOM && role.deptIds) {
        for (const deptId of role.deptIds) {
          deptIds.add(deptId);
        }
      }
    }

    return Array.from(deptIds);
  }

  /**
   * 获取本部门及以下部门ID列表
   */
  private getDeptAndChildIds(user: any): number[] {
    // 这里需要从用户对象中获取部门树信息
    // 实际实现中可能需要查询数据库获取子部门
    const deptIds: number[] = [];

    if (user.deptId) {
      deptIds.push(user.deptId);
    }

    // 如果用户对象中包含子部门信息
    if (user.childDeptIds) {
      deptIds.push(...user.childDeptIds);
    }

    return deptIds;
  }
}

/**
 * 数据权限SQL构建器
 * 用于在Service层构建数据权限SQL条件
 */
export class DataPermissionSqlBuilder {
  /**
   * 构建Prisma where条件
   */
  static buildPrismaWhere(context: DataPermissionContext | null): Record<string, any> {
    if (!context || !context.enabled) {
      return {};
    }

    const { dataScope, userId, deptIds, options } = context;
    const deptIdColumn = options.deptIdColumn || 'deptId';
    const userIdColumn = options.userIdColumn || 'userId';

    switch (dataScope) {
      case DataScope.ALL:
        return {};

      case DataScope.DEPT_CUSTOM:
      case DataScope.DEPT_ONLY:
      case DataScope.DEPT_AND_CHILD:
        if (deptIds.length === 0) {
          return {};
        }
        return {
          [deptIdColumn]: {
            in: deptIds,
          },
        };

      case DataScope.SELF:
        return {
          [userIdColumn]: userId,
        };

      default:
        return {};
    }
  }

  /**
   * 构建原生SQL条件
   */
  static buildRawSqlCondition(
    context: DataPermissionContext | null,
    tableAlias?: string,
  ): { sql: string; params: any[] } {
    if (!context || !context.enabled) {
      return { sql: '1=1', params: [] };
    }

    const { dataScope, userId, deptIds, options } = context;
    const alias = tableAlias || options.deptAlias || '';
    const prefix = alias ? `${alias}.` : '';
    const deptIdColumn = options.deptIdColumn || 'dept_id';
    const userIdColumn = options.userIdColumn || 'user_id';

    switch (dataScope) {
      case DataScope.ALL:
        return { sql: '1=1', params: [] };

      case DataScope.DEPT_CUSTOM:
      case DataScope.DEPT_ONLY:
      case DataScope.DEPT_AND_CHILD:
        if (deptIds.length === 0) {
          return { sql: '1=1', params: [] };
        }
        const placeholders = deptIds.map(() => '?').join(',');
        return {
          sql: `${prefix}${deptIdColumn} IN (${placeholders})`,
          params: deptIds,
        };

      case DataScope.SELF:
        return {
          sql: `${prefix}${userIdColumn} = ?`,
          params: [userId],
        };

      default:
        return { sql: '1=1', params: [] };
    }
  }
}
