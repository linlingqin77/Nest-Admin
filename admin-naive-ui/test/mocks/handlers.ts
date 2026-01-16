/**
 * MSW Handlers
 *
 * @description
 * 定义 API Mock 处理器
 *
 * @requirements 14.1, 5.3
 */

import { HttpResponse, http } from 'msw';

/**
 * 模拟用户数据
 */
export const mockUsers = [
  {
    userId: 1,
    userName: 'admin',
    nickName: '超级管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    status: '0',
    createTime: '2024-01-01 00:00:00'
  },
  {
    userId: 2,
    userName: 'user',
    nickName: '普通用户',
    email: 'user@example.com',
    phone: '13800138001',
    status: '0',
    createTime: '2024-01-02 00:00:00'
  }
];

/**
 * 模拟角色数据
 */
export const mockRoles = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    roleSort: 1,
    status: '0'
  },
  {
    roleId: 2,
    roleName: '普通角色',
    roleKey: 'common',
    roleSort: 2,
    status: '0'
  }
];

/**
 * 模拟菜单数据
 */
export const mockMenus = [
  {
    menuId: 1,
    menuName: '系统管理',
    parentId: 0,
    orderNum: 1,
    path: 'system',
    component: null,
    menuType: 'M',
    visible: '0',
    status: '0',
    icon: 'system'
  },
  {
    menuId: 100,
    menuName: '用户管理',
    parentId: 1,
    orderNum: 1,
    path: 'user',
    component: 'system/user/index',
    menuType: 'C',
    visible: '0',
    status: '0',
    icon: 'user'
  }
];

/**
 * 创建成功响应
 */
export const createSuccessResponse = <T>(data: T, msg = '操作成功') => ({
  code: 200,
  msg,
  data
});

/**
 * 创建分页响应
 */
export const createPageResponse = <T>(rows: T[], total: number, pageNum = 1, pageSize = 10) => ({
  code: 200,
  msg: '操作成功',
  data: {
    rows,
    total,
    pageNum,
    pageSize,
    pages: Math.ceil(total / pageSize)
  }
});

/**
 * 创建错误响应
 */
export const createErrorResponse = (code: number, msg: string) => ({
  code,
  msg,
  data: null
});

/**
 * API 处理器
 */
export const handlers = [
  // 登录接口
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { userName: string; password: string };

    if (body.userName === 'admin' && body.password === 'admin123') {
      return HttpResponse.json(
        createSuccessResponse({
          token: 'mock-token-12345',
          userInfo: mockUsers[0]
        })
      );
    }
    return HttpResponse.json(createErrorResponse(401, '用户名或密码错误'));
  }),

  // 获取用户信息接口
  http.get('/api/auth/info', () => {
    return HttpResponse.json(
      createSuccessResponse({
        ...mockUsers[0],
        roles: ['admin'],
        permissions: ['*:*:*']
      })
    );
  }),

  // 登出接口
  http.post('/api/auth/logout', () => {
    return HttpResponse.json(createSuccessResponse(null, '登出成功'));
  }),

  // 用户列表接口
  http.get('/api/system/user/list', () => {
    return HttpResponse.json(createPageResponse(mockUsers, mockUsers.length));
  }),

  // 获取用户详情
  http.get('/api/system/user/:id', ({ params }) => {
    const userId = Number(params.id);
    const user = mockUsers.find(u => u.userId === userId);
    if (user) {
      return HttpResponse.json(createSuccessResponse(user));
    }
    return HttpResponse.json(createErrorResponse(404, '用户不存在'));
  }),

  // 角色列表接口
  http.get('/api/system/role/list', () => {
    return HttpResponse.json(createPageResponse(mockRoles, mockRoles.length));
  }),

  // 菜单列表接口
  http.get('/api/system/menu/list', () => {
    return HttpResponse.json(createSuccessResponse(mockMenus));
  })
];

export default handlers;
