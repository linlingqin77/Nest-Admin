/**
 * 用户测试数据工厂
 *
 * @description
 * 提供创建前端测试用户数据的工厂方法
 *
 * @requirements 4.1, 4.2
 */

/**
 * 用户信息类型
 */
export interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  phone?: string;
  sex?: '0' | '1' | '2';
  avatar?: string;
  status: '0' | '1';
  deptId?: number;
  deptName?: string;
  roleIds?: number[];
  roles?: RoleInfo[];
  createTime?: string;
  updateTime?: string;
}

/**
 * 角色信息类型
 */
export interface RoleInfo {
  roleId: number;
  roleName: string;
  roleKey: string;
  status: '0' | '1';
}

/**
 * 用户 Fixture 配置选项
 */
export interface UserFixtureOptions {
  userId?: number;
  userName?: string;
  nickName?: string;
  email?: string;
  phone?: string;
  status?: '0' | '1';
  deptId?: number;
  roleIds?: number[];
}

// 计数器用于生成唯一 ID
let userIdCounter = 100;

/**
 * 创建用户 Fixture
 */
export const createUserFixture = (options: UserFixtureOptions = {}): UserInfo => {
  const userId = options.userId ?? ++userIdCounter;
  return {
    userId,
    userName: options.userName ?? `user_${userId}`,
    nickName: options.nickName ?? `测试用户${userId}`,
    email: options.email ?? `user${userId}@test.example.com`,
    phone: options.phone ?? `138${String(userId).padStart(8, '0')}`,
    sex: '0',
    avatar: '',
    status: options.status ?? '0',
    deptId: options.deptId ?? 100,
    deptName: '测试部门',
    roleIds: options.roleIds ?? [2],
    roles: [
      {
        roleId: 2,
        roleName: '普通角色',
        roleKey: 'common',
        status: '0'
      }
    ],
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
};

/**
 * 创建用户列表 Fixture
 */
export const createUserListFixture = (count: number, options: UserFixtureOptions = {}): UserInfo[] => {
  return Array.from({ length: count }, (_, index) =>
    createUserFixture({
      ...options,
      userId: options.userId ? options.userId + index : undefined
    })
  );
};

/**
 * 创建管理员用户 Fixture
 */
export const createAdminUserFixture = (options: Partial<UserFixtureOptions> = {}): UserInfo => {
  return {
    userId: 1,
    userName: 'admin',
    nickName: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    sex: '0',
    avatar: '',
    status: '0',
    deptId: 100,
    deptName: '总部',
    roleIds: [1],
    roles: [
      {
        roleId: 1,
        roleName: '超级管理员',
        roleKey: 'admin',
        status: '0'
      }
    ],
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00',
    ...options
  };
};

/**
 * 创建禁用用户 Fixture
 */
export const createDisabledUserFixture = (options: Partial<UserFixtureOptions> = {}): UserInfo => {
  return createUserFixture({
    ...options,
    status: '1'
  });
};

/**
 * 重置用户 ID 计数器
 */
export const resetUserIdCounter = (): void => {
  userIdCounter = 100;
};

export default {
  createUserFixture,
  createUserListFixture,
  createAdminUserFixture,
  createDisabledUserFixture,
  resetUserIdCounter
};
