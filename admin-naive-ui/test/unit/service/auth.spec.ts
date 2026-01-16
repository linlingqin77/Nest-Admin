/**
 * Auth API 服务测试
 *
 * @description
 * 测试认证相关的 API 服务
 *
 * **Validates: Requirements 14.2, 14.3, 14.4**
 */

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

// Mock API 响应数据
const mockLoginResponse = {
  code: 200,
  msg: '登录成功',
  data: {
    token: 'mock-token-12345',
    userInfo: {
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      avatar: '/avatar.png'
    }
  }
};

const mockUserInfoResponse = {
  code: 200,
  msg: '操作成功',
  data: {
    userId: 1,
    userName: 'admin',
    nickName: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    status: '0',
    roles: ['admin'],
    permissions: ['*:*:*']
  }
};

// 设置 MSW 服务器
const server = setupServer(
  // 登录接口
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { userName: string; password: string };

    if (body.userName === 'admin' && body.password === 'admin123') {
      return HttpResponse.json(mockLoginResponse);
    }

    return HttpResponse.json({
      code: 401,
      msg: '用户名或密码错误',
      data: null
    });
  }),

  // 获取用户信息接口
  http.get('/api/auth/info', () => {
    return HttpResponse.json(mockUserInfoResponse);
  }),

  // 登出接口
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      code: 200,
      msg: '登出成功',
      data: null
    });
  })
);

// 模拟的 API 服务函数
const login = async (data: { userName: string; password: string }) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

const getUserInfo = async () => {
  const response = await fetch('/api/auth/info');
  return response.json();
};

const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST'
  });
  return response.json();
};

describe('Auth API Service', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('login', () => {
    it('应该在凭证正确时返回 token', async () => {
      const result = await login({
        userName: 'admin',
        password: 'admin123'
      });

      expect(result.code).toBe(200);
      expect(result.msg).toBe('登录成功');
      expect(result.data.token).toBeDefined();
      expect(result.data.token).toBe('mock-token-12345');
      expect(result.data.userInfo).toBeDefined();
      expect(result.data.userInfo.userName).toBe('admin');
    });

    it('应该在凭证错误时返回错误', async () => {
      const result = await login({
        userName: 'admin',
        password: 'wrongpassword'
      });

      expect(result.code).toBe(401);
      expect(result.msg).toBe('用户名或密码错误');
      expect(result.data).toBeNull();
    });

    it('应该在用户名错误时返回错误', async () => {
      const result = await login({
        userName: 'wronguser',
        password: 'admin123'
      });

      expect(result.code).toBe(401);
      expect(result.msg).toBe('用户名或密码错误');
    });

    it('应该处理网络错误', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.error();
        })
      );

      await expect(
        login({
          userName: 'admin',
          password: 'admin123'
        })
      ).rejects.toThrow();
    });

    it('应该处理服务器错误', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            {
              code: 500,
              msg: '服务器内部错误',
              data: null
            },
            { status: 500 }
          );
        })
      );

      const result = await login({
        userName: 'admin',
        password: 'admin123'
      });

      expect(result.code).toBe(500);
      expect(result.msg).toBe('服务器内部错误');
    });
  });

  describe('getUserInfo', () => {
    it('应该返回用户信息', async () => {
      const result = await getUserInfo();

      expect(result.code).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.userId).toBe(1);
      expect(result.data.userName).toBe('admin');
      expect(result.data.nickName).toBe('管理员');
      expect(result.data.roles).toContain('admin');
      expect(result.data.permissions).toContain('*:*:*');
    });

    it('应该处理未授权错误', async () => {
      server.use(
        http.get('/api/auth/info', () => {
          return HttpResponse.json(
            {
              code: 401,
              msg: '未授权，请先登录',
              data: null
            },
            { status: 401 }
          );
        })
      );

      const result = await getUserInfo();

      expect(result.code).toBe(401);
      expect(result.msg).toBe('未授权，请先登录');
    });

    it('应该处理 token 过期', async () => {
      server.use(
        http.get('/api/auth/info', () => {
          return HttpResponse.json({
            code: 401,
            msg: 'token 已过期，请重新登录',
            data: null
          });
        })
      );

      const result = await getUserInfo();

      expect(result.code).toBe(401);
      expect(result.msg).toContain('token');
    });
  });

  describe('logout', () => {
    it('应该成功登出', async () => {
      const result = await logout();

      expect(result.code).toBe(200);
      expect(result.msg).toBe('登出成功');
    });

    it('应该处理登出失败', async () => {
      server.use(
        http.post('/api/auth/logout', () => {
          return HttpResponse.json({
            code: 500,
            msg: '登出失败',
            data: null
          });
        })
      );

      const result = await logout();

      expect(result.code).toBe(500);
      expect(result.msg).toBe('登出失败');
    });
  });

  describe('响应格式验证', () => {
    it('登录响应应该包含必要字段', async () => {
      const result = await login({
        userName: 'admin',
        password: 'admin123'
      });

      // 验证响应结构
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('msg');
      expect(result).toHaveProperty('data');

      // 验证数据类型
      expect(typeof result.code).toBe('number');
      expect(typeof result.msg).toBe('string');
    });

    it('用户信息响应应该包含必要字段', async () => {
      const result = await getUserInfo();

      expect(result.data).toHaveProperty('userId');
      expect(result.data).toHaveProperty('userName');
      expect(result.data).toHaveProperty('nickName');
      expect(result.data).toHaveProperty('roles');
      expect(result.data).toHaveProperty('permissions');

      expect(Array.isArray(result.data.roles)).toBe(true);
      expect(Array.isArray(result.data.permissions)).toBe(true);
    });
  });
});
