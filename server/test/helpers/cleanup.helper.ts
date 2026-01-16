/**
 * 数据清理辅助函数
 *
 * @description
 * 提供测试数据清理的辅助函数
 * 确保测试之间的数据隔离
 *
 * @requirements 4.5
 */

import { PrismaClient } from '@prisma/client';

/**
 * 清理选项
 */
export interface CleanupOptions {
  /** 保留的用户 ID 列表 */
  preserveUserIds?: number[];
  /** 保留的角色 ID 列表 */
  preserveRoleIds?: number[];
  /** 保留的租户 ID 列表 */
  preserveTenantIds?: string[];
  /** 是否清理日志 */
  cleanLogs?: boolean;
  /** 测试数据前缀（用于识别测试数据） */
  testDataPrefix?: string;
}

/**
 * 默认保留的系统数据 ID
 */
const DEFAULT_PRESERVE = {
  userIds: [1], // 超级管理员
  roleIds: [1], // 超级管理员角色
  tenantIds: ['000000'], // 默认租户
};

/**
 * 清理测试数据
 *
 * @param prisma Prisma 客户端实例
 * @param options 清理选项
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   await cleanupTestData(prisma);
 * });
 *
 * // 保留特定数据
 * await cleanupTestData(prisma, {
 *   preserveUserIds: [1, 2],
 *   preserveRoleIds: [1],
 * });
 * ```
 */
export const cleanupTestData = async (prisma: PrismaClient, options: CleanupOptions = {}): Promise<void> => {
  const {
    preserveUserIds = DEFAULT_PRESERVE.userIds,
    preserveRoleIds = DEFAULT_PRESERVE.roleIds,
    preserveTenantIds = DEFAULT_PRESERVE.tenantIds,
    cleanLogs = false,
    testDataPrefix = 'test_',
  } = options;

  // 使用事务确保数据一致性
  await prisma.$transaction(async (tx) => {
    // 1. 清理用户角色关联
    await tx.sysUserRole.deleteMany({
      where: {
        userId: { notIn: preserveUserIds },
      },
    });

    // 2. 清理用户岗位关联
    await tx.sysUserPost.deleteMany({
      where: {
        userId: { notIn: preserveUserIds },
      },
    });

    // 3. 清理测试用户
    await tx.sysUser.deleteMany({
      where: {
        AND: [
          { userId: { notIn: preserveUserIds } },
          {
            OR: [
              { userName: { startsWith: testDataPrefix } },
              { userId: { gt: 100 } }, // 假设 ID > 100 的是测试数据
            ],
          },
        ],
      },
    });

    // 4. 清理角色菜单关联
    await tx.sysRoleMenu.deleteMany({
      where: {
        roleId: { notIn: preserveRoleIds },
      },
    });

    // 5. 清理角色部门关联
    await tx.sysRoleDept.deleteMany({
      where: {
        roleId: { notIn: preserveRoleIds },
      },
    });

    // 6. 清理测试角色
    await tx.sysRole.deleteMany({
      where: {
        AND: [
          { roleId: { notIn: preserveRoleIds } },
          {
            OR: [{ roleKey: { startsWith: testDataPrefix } }, { roleId: { gt: 100 } }],
          },
        ],
      },
    });

    // 7. 清理测试租户
    await tx.sysTenant.deleteMany({
      where: {
        AND: [
          { tenantId: { notIn: preserveTenantIds } },
          {
            OR: [{ companyName: { startsWith: testDataPrefix } }, { id: { gt: 100 } }],
          },
        ],
      },
    });

    // 8. 可选：清理日志
    if (cleanLogs) {
      await tx.sysOperLog.deleteMany({
        where: {
          operName: { startsWith: testDataPrefix },
        },
      });

      await tx.sysLoginLog.deleteMany({
        where: {
          userName: { startsWith: testDataPrefix },
        },
      });
    }
  });
};

/**
 * 清理特定用户的测试数据
 *
 * @param prisma Prisma 客户端实例
 * @param userIds 要清理的用户 ID 列表
 */
export const cleanupUserData = async (prisma: PrismaClient, userIds: number[]): Promise<void> => {
  await prisma.$transaction([
    prisma.sysUserRole.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.sysUserPost.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.sysUser.deleteMany({ where: { userId: { in: userIds } } }),
  ]);
};

/**
 * 清理特定角色的测试数据
 *
 * @param prisma Prisma 客户端实例
 * @param roleIds 要清理的角色 ID 列表
 */
export const cleanupRoleData = async (prisma: PrismaClient, roleIds: number[]): Promise<void> => {
  await prisma.$transaction([
    prisma.sysUserRole.deleteMany({ where: { roleId: { in: roleIds } } }),
    prisma.sysRoleMenu.deleteMany({ where: { roleId: { in: roleIds } } }),
    prisma.sysRoleDept.deleteMany({ where: { roleId: { in: roleIds } } }),
    prisma.sysRole.deleteMany({ where: { roleId: { in: roleIds } } }),
  ]);
};

/**
 * 清理特定租户的测试数据
 *
 * @param prisma Prisma 客户端实例
 * @param tenantIds 要清理的租户 ID 列表
 */
export const cleanupTenantData = async (prisma: PrismaClient, tenantIds: string[]): Promise<void> => {
  await prisma.$transaction([
    // 先清理租户下的用户
    prisma.sysUser.deleteMany({ where: { tenantId: { in: tenantIds } } }),
    // 再清理租户下的角色
    prisma.sysRole.deleteMany({ where: { tenantId: { in: tenantIds } } }),
    // 最后清理租户
    prisma.sysTenant.deleteMany({ where: { tenantId: { in: tenantIds } } }),
  ]);
};

/**
 * 重置数据库到初始状态
 *
 * @param prisma Prisma 客户端实例
 *
 * @warning 此操作会删除所有非系统数据，请谨慎使用
 */
export const resetDatabase = async (prisma: PrismaClient): Promise<void> => {
  await cleanupTestData(prisma, {
    cleanLogs: true,
  });
};

/**
 * 创建清理函数（用于 afterEach）
 *
 * @param prisma Prisma 客户端实例
 * @param options 清理选项
 * @returns 清理函数
 *
 * @example
 * ```typescript
 * const cleanup = createCleanupFunction(prisma);
 * afterEach(cleanup);
 * ```
 */
export const createCleanupFunction = (prisma: PrismaClient, options: CleanupOptions = {}): (() => Promise<void>) => {
  return () => cleanupTestData(prisma, options);
};

/**
 * 记录创建的测试数据 ID（用于后续清理）
 */
export class TestDataTracker {
  private userIds: number[] = [];
  private roleIds: number[] = [];
  private tenantIds: string[] = [];

  /**
   * 记录用户 ID
   */
  trackUser(userId: number): void {
    this.userIds.push(userId);
  }

  /**
   * 记录角色 ID
   */
  trackRole(roleId: number): void {
    this.roleIds.push(roleId);
  }

  /**
   * 记录租户 ID
   */
  trackTenant(tenantId: string): void {
    this.tenantIds.push(tenantId);
  }

  /**
   * 清理所有记录的测试数据
   */
  async cleanup(prisma: PrismaClient): Promise<void> {
    if (this.userIds.length > 0) {
      await cleanupUserData(prisma, this.userIds);
    }
    if (this.roleIds.length > 0) {
      await cleanupRoleData(prisma, this.roleIds);
    }
    if (this.tenantIds.length > 0) {
      await cleanupTenantData(prisma, this.tenantIds);
    }
    this.reset();
  }

  /**
   * 重置追踪器
   */
  reset(): void {
    this.userIds = [];
    this.roleIds = [];
    this.tenantIds = [];
  }
}

export default {
  cleanupTestData,
  cleanupUserData,
  cleanupRoleData,
  cleanupTenantData,
  resetDatabase,
  createCleanupFunction,
  TestDataTracker,
};
