import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { TenantContext } from '../context/tenant.context';
import { hasTenantField, SUPER_TENANT_ID } from '../constants/tenant-models';

const logger = new Logger('TenantExtension');

// 使用 any 类型来避免 Prisma 复杂类型的兼容性问题
type AnyRecord = any;

/**
 * 判断是否应该应用租户过滤
 */
function shouldApplyFilter(model: string): boolean {
  return hasTenantField(model) && TenantContext.shouldApplyTenantFilter();
}

/**
 * 添加租户过滤条件到 where 子句
 */
function addTenantFilter(where: AnyRecord | undefined): AnyRecord {
  const tenantId = TenantContext.getTenantId();
  if (!tenantId) {
    return where || {};
  }

  const baseWhere = where || {};

  // 处理复杂的 where 条件
  if (baseWhere.AND) {
    return {
      ...baseWhere,
      AND: [...(baseWhere.AND as unknown[]), { tenantId }],
    };
  }

  if (baseWhere.OR) {
    return {
      AND: [{ tenantId }, { OR: baseWhere.OR }],
    };
  }

  return {
    ...baseWhere,
    tenantId,
  };
}

/**
 * 设置单条记录的租户ID
 */
function setTenantId(data: AnyRecord): AnyRecord {
  const tenantId = TenantContext.getTenantId() || SUPER_TENANT_ID;
  return {
    ...data,
    tenantId: data.tenantId || tenantId,
  };
}

/**
 * 设置多条记录的租户ID
 */
function setTenantIdForMany(data: AnyRecord | AnyRecord[]): AnyRecord | AnyRecord[] {
  const tenantId = TenantContext.getTenantId() || SUPER_TENANT_ID;

  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      tenantId: item.tenantId || tenantId,
    }));
  }

  return {
    ...data,
    tenantId: data.tenantId || tenantId,
  };
}

/**
 * 验证查询结果是否属于当前租户 (用于 findUnique)
 */
function validateTenantOwnership<T>(model: string, result: T): T | null {
  if (!result || !hasTenantField(model)) {
    return result;
  }

  if (TenantContext.isIgnoreTenant() || TenantContext.isSuperTenant()) {
    return result;
  }

  const currentTenantId = TenantContext.getTenantId();
  if (!currentTenantId) {
    return result;
  }

  const record = result as AnyRecord;
  if (record.tenantId && record.tenantId !== currentTenantId) {
    const requestId = TenantContext.getRequestId();
    logger.warn(
      `[${requestId}] Cross-tenant access attempt blocked: ` +
        `model=${model}, expected tenantId=${currentTenantId}, actual tenantId=${record.tenantId}`,
    );
    return null;
  }

  return result;
}

/**
 * 创建租户扩展
 *
 * 使用 Prisma $extends API 替代已弃用的 $use 中间件
 * 自动为需要租户隔离的模型添加租户过滤条件，并在创建数据时自动设置租户ID
 *
 * @returns Prisma 扩展配置
 */
export function createTenantExtension() {
  return Prisma.defineExtension({
    name: 'tenant-extension',
    query: {
      $allModels: {
        // 查询操作：添加租户过滤
        async findMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async findFirst({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async findFirstOrThrow({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async findUnique({ model, args, query }) {
          const result = await query(args);
          return validateTenantOwnership(model, result as AnyRecord | null);
        },

        async findUniqueOrThrow({ model, args, query }) {
          const result = await query(args);
          const validated = validateTenantOwnership(model, result as AnyRecord | null);
          if (!validated) {
            throw new Error(`Record not found or access denied for model ${model}`);
          }
          return validated;
        },

        async count({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async aggregate({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async groupBy({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        // 创建操作：设置租户ID
        async create({ model, args, query }) {
          if (hasTenantField(model)) {
            args.data = setTenantId(args.data);
          }
          return query(args);
        },

        async createMany({ model, args, query }) {
          if (hasTenantField(model)) {
            args.data = setTenantIdForMany(args.data);
          }
          return query(args);
        },

        async createManyAndReturn({ model, args, query }) {
          if (hasTenantField(model)) {
            args.data = setTenantIdForMany(args.data);
          }
          return query(args);
        },

        // 更新操作：添加租户过滤
        async update({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async updateMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        // 删除操作：添加租户过滤
        async delete({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        async deleteMany({ model, args, query }) {
          if (shouldApplyFilter(model)) {
            args.where = addTenantFilter(args.where);
          }
          return query(args);
        },

        // upsert 操作
        async upsert({ model, args, query }) {
          if (hasTenantField(model)) {
            args.create = setTenantId(args.create);
            if (shouldApplyFilter(model)) {
              args.where = addTenantFilter(args.where);
            }
          }
          return query(args);
        },
      },
    },
  });
}

// 导出辅助函数供测试使用
export const tenantExtensionHelpers = {
  shouldApplyFilter,
  addTenantFilter,
  setTenantId,
  setTenantIdForMany,
  validateTenantOwnership,
};
