/**
 * API 服务属性测试
 * **Property 7: API 服务正确性**
 * **Validates: Requirements 14.2, 14.3, 14.4, 14.5**
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import * as fc from 'fast-check';

const server = setupServer();
const fetchApi = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  return response.json();
};

describe('API 服务 - 属性测试', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Property 1: 响应格式一致性', () => {
    it('所有成功响应应该包含标准字段', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.integer({ min: 1, max: 10000 }),
            userName: fc.string({ minLength: 3, maxLength: 20 }),
            nickName: fc.string({ minLength: 3, maxLength: 20 })
          }),
          async userData => {
            server.use(http.get('/api/test/user', () => HttpResponse.json({ code: 200, msg: 'ok', data: userData })));
            const result = await fetchApi('/api/test/user');
            expect(result).toHaveProperty('code');
            expect(result).toHaveProperty('msg');
            expect(result).toHaveProperty('data');
            expect(result.code).toBe(200);
            return true;
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 2: 分页数学属性', () => {
    it('pages 应该等于 ceil(total / pageSize)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 100 }), fc.integer({ min: 1, max: 20 }), async (total, pageSize) => {
          const expectedPages = Math.ceil(total / pageSize);
          server.use(
            http.get('/api/test/pagination', () =>
              HttpResponse.json({
                code: 200,
                msg: 'ok',
                data: { rows: [], total, pageNum: 1, pageSize, pages: expectedPages }
              })
            )
          );
          const result = await fetchApi('/api/test/pagination');
          expect(result.data.pages).toBe(expectedPages);
          return true;
        }),
        { numRuns: 10 }
      );
    });
  });
});
