import * as fc from 'fast-check';
import { Result } from '../../../../src/shared/response/result';
import { ResponseCode, ResponseMessage } from '../../../../src/shared/response/response.interface';

/**
 * Property-Based Tests for Result class
 *
 * Feature: api-response-validation
 * 测试 Result 类的核心方法在各种输入下的行为
 */
describe('Result Property-Based Tests', () => {
  /**
   * Property 6: Result.ok() Code Consistency
   *
   * For any data passed to Result.ok(), the returned Result SHALL have code 200
   * and the data field SHALL equal the input data.
   *
   * **Validates: Requirements 3.1**
   */
  describe('Property 6: Result.ok() Code Consistency', () => {
    it('For any data, Result.ok() SHALL return code 200', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.ok(data);
          return result.code === 200;
        }),
        { numRuns: 100 },
      );
    });

    it('For any data, Result.ok() SHALL preserve the input data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.double(),
            fc.boolean(),
            fc.array(fc.integer()),
            fc.record({ id: fc.integer(), name: fc.string() }),
          ),
          (data) => {
            const result = Result.ok(data);
            // 深度比较数据
            return JSON.stringify(result.data) === JSON.stringify(data);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any data, Result.ok() SHALL return a success message', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.ok(data);
          return typeof result.msg === 'string' && result.msg.length > 0;
        }),
        { numRuns: 100 },
      );
    });

    it('For any custom message, Result.ok() SHALL use the provided message', () => {
      fc.assert(
        fc.property(fc.anything(), fc.string({ minLength: 1 }), (data: unknown, customMsg: string) => {
          const result = Result.ok(data, customMsg);
          return result.msg === customMsg;
        }),
        { numRuns: 100 },
      );
    });

    it('Result.ok() with undefined data SHALL return null data', () => {
      fc.assert(
        fc.property(fc.constant(undefined), () => {
          const result = Result.ok(undefined);
          return result.data === null;
        }),
        { numRuns: 10 },
      );
    });
  });

  /**
   * Property 7: Result.fail() Error Propagation
   *
   * For any error code and message passed to Result.fail(), the returned Result
   * SHALL have the specified code and msg.
   *
   * **Validates: Requirements 3.2**
   */
  describe('Property 7: Result.fail() Error Propagation', () => {
    // 获取所有有效的 ResponseCode 值
    const allResponseCodes = Object.values(ResponseCode).filter(
      (value): value is ResponseCode => typeof value === 'number',
    );

    it('For any ResponseCode, Result.fail() SHALL return that code', () => {
      fc.assert(
        fc.property(fc.constantFrom(...allResponseCodes), (code: ResponseCode) => {
          const result = Result.fail(code);
          return result.code === code;
        }),
        { numRuns: 100 },
      );
    });

    it('For any custom message, Result.fail() SHALL use the provided message', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allResponseCodes),
          fc.string({ minLength: 1 }),
          (code: ResponseCode, customMsg: string) => {
            const result = Result.fail(code, customMsg);
            return result.msg === customMsg;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any ResponseCode without custom message, Result.fail() SHALL use default message', () => {
      fc.assert(
        fc.property(fc.constantFrom(...allResponseCodes), (code: ResponseCode) => {
          const result = Result.fail(code);
          const expectedMsg = ResponseMessage[code] || '操作失败';
          return result.msg === expectedMsg;
        }),
        { numRuns: 100 },
      );
    });

    it('Result.fail() SHALL return null data by default', () => {
      fc.assert(
        fc.property(fc.constantFrom(...allResponseCodes), (code: ResponseCode) => {
          const result = Result.fail(code);
          return result.data === null;
        }),
        { numRuns: 100 },
      );
    });

    it('For any error data, Result.fail() SHALL preserve the error data', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...allResponseCodes),
          fc.string(),
          fc.record({ field: fc.string(), reason: fc.string() }),
          (code: ResponseCode, msg: string, errorData) => {
            const result = Result.fail(code, msg, errorData);
            return (
              result.code === code && result.msg === msg && JSON.stringify(result.data) === JSON.stringify(errorData)
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Result.fail() without arguments SHALL use default BUSINESS_ERROR code', () => {
      const result = Result.fail();
      expect(result.code).toBe(ResponseCode.BUSINESS_ERROR);
    });
  });

  /**
   * Property 8: Result.page() Pagination Format
   *
   * For any valid pagination parameters (rows, total, pageNum, pageSize),
   * Result.page() SHALL return a properly formatted pagination response
   * with calculated pages field.
   *
   * **Validates: Requirements 3.3**
   */
  describe('Property 8: Result.page() Pagination Format', () => {
    it('For any pagination parameters, Result.page() SHALL return code 200', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), name: fc.string() })),
          fc.nat({ max: 10000 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (rows, total, pageNum, pageSize) => {
            const result = Result.page(rows, total, pageNum, pageSize);
            return result.code === 200;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any pagination parameters, Result.page() SHALL include all required fields', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.nat({ max: 10000 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (rows, total, pageNum, pageSize) => {
            const result = Result.page(rows, total, pageNum, pageSize);
            const data = result.data;

            return (
              data !== null &&
              Array.isArray(data.rows) &&
              typeof data.total === 'number' &&
              typeof data.pageNum === 'number' &&
              typeof data.pageSize === 'number' &&
              typeof data.pages === 'number'
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any pagination parameters, pages SHALL be correctly calculated', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.nat({ max: 10000 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (rows, total, pageNum, pageSize) => {
            const result = Result.page(rows, total, pageNum, pageSize);
            const expectedPages = Math.ceil(total / pageSize);
            return result.data!.pages === expectedPages;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any rows array, Result.page() SHALL preserve the rows data', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
          fc.nat({ max: 1000 }),
          fc.integer({ min: 1, max: 50 }),
          fc.integer({ min: 1, max: 50 }),
          (rows, total, pageNum, pageSize) => {
            const result = Result.page(rows, total, pageNum, pageSize);
            return JSON.stringify(result.data!.rows) === JSON.stringify(rows);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For total=0, pages SHALL be 0', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), fc.integer({ min: 1, max: 100 }), (pageNum, pageSize) => {
          const result = Result.page([], 0, pageNum, pageSize);
          return result.data!.pages === 0;
        }),
        { numRuns: 100 },
      );
    });

    it('For any total and pageSize, pages SHALL satisfy: pages * pageSize >= total', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (rows, total, pageNum, pageSize) => {
            const result = Result.page(rows, total, pageNum, pageSize);
            const pages = result.data!.pages!;
            // pages * pageSize should be >= total (enough to hold all items)
            return pages * pageSize >= total;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 9: Result.fromPromise() Success Handling
   *
   * For any resolved Promise, Result.fromPromise() SHALL return a Result with code 200.
   *
   * **Validates: Requirements 3.6**
   */
  describe('Property 9: Result.fromPromise() Success Handling', () => {
    it('For any resolved Promise, Result.fromPromise() SHALL return code 200', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.integer()),
            fc.record({ id: fc.integer(), name: fc.string() }),
          ),
          async (data) => {
            const promise = Promise.resolve(data);
            const result = await Result.fromPromise(promise);
            return result.code === 200;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For any resolved Promise, Result.fromPromise() SHALL preserve the data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.integer()),
            fc.record({ id: fc.integer(), name: fc.string() }),
          ),
          async (data) => {
            const promise = Promise.resolve(data);
            const result = await Result.fromPromise(promise);
            return JSON.stringify(result.data) === JSON.stringify(data);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For resolved Promise with null, Result.fromPromise() SHALL return null data with code 200', async () => {
      const result = await Result.fromPromise(Promise.resolve(null));
      expect(result.code).toBe(200);
      expect(result.data).toBeNull();
    });

    it('For resolved Promise with undefined, Result.fromPromise() SHALL return code 200', async () => {
      const result = await Result.fromPromise(Promise.resolve(undefined));
      expect(result.code).toBe(200);
    });
  });

  /**
   * Property 10: Result.fromPromise() Error Handling
   *
   * For any rejected Promise, Result.fromPromise() SHALL return a Result with non-200 code.
   *
   * **Validates: Requirements 3.7**
   */
  describe('Property 10: Result.fromPromise() Error Handling', () => {
    it('For any rejected Promise with Error, Result.fromPromise() SHALL return non-200 code', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1 }), async (errorMessage: string) => {
          const promise = Promise.reject(new Error(errorMessage));
          const result = await Result.fromPromise(promise);
          return result.code !== 200;
        }),
        { numRuns: 100 },
      );
    });

    it('For any rejected Promise with Error, Result.fromPromise() SHALL use error message', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1 }), async (errorMessage: string) => {
          const promise = Promise.reject(new Error(errorMessage));
          const result = await Result.fromPromise(promise);
          return result.msg === errorMessage;
        }),
        { numRuns: 100 },
      );
    });

    it('For rejected Promise with custom failCode, Result.fromPromise() SHALL use that code', async () => {
      const allResponseCodes = Object.values(ResponseCode).filter(
        (value): value is ResponseCode => typeof value === 'number' && value !== 200,
      );

      await fc.assert(
        fc.asyncProperty(fc.constantFrom(...allResponseCodes), async (failCode: ResponseCode) => {
          const promise = Promise.reject(new Error('test error'));
          const result = await Result.fromPromise(promise, failCode);
          return result.code === failCode;
        }),
        { numRuns: 100 },
      );
    });

    it('For rejected Promise with non-Error value, Result.fromPromise() SHALL return default message', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (errorValue: string) => {
          const promise = Promise.reject(errorValue);
          const result = await Result.fromPromise(promise);
          return result.code !== 200 && result.msg === '操作失败';
        }),
        { numRuns: 100 },
      );
    });

    it('For rejected Promise, Result.fromPromise() SHALL return null data', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1 }), async (errorMessage: string) => {
          const promise = Promise.reject(new Error(errorMessage));
          const result = await Result.fromPromise(promise);
          return result.data === null;
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Additional Property Tests: Result.when()
   *
   * **Validates: Requirements 3.4, 3.5**
   */
  describe('Result.when() Property Tests', () => {
    it('For true condition, Result.when() SHALL return code 200', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.when(true, data);
          return result.code === 200;
        }),
        { numRuns: 100 },
      );
    });

    it('For true condition, Result.when() SHALL preserve the data', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.array(fc.integer()), fc.record({ id: fc.integer() })),
          (data) => {
            const result = Result.when(true, data);
            return JSON.stringify(result.data) === JSON.stringify(data);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('For false condition, Result.when() SHALL return non-200 code', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.when(false, data);
          return result.code !== 200;
        }),
        { numRuns: 100 },
      );
    });

    it('For false condition with custom failCode, Result.when() SHALL use that code', () => {
      const allResponseCodes = Object.values(ResponseCode).filter(
        (value): value is ResponseCode => typeof value === 'number' && value !== 200,
      );

      fc.assert(
        fc.property(fc.anything(), fc.constantFrom(...allResponseCodes), (data: unknown, failCode: ResponseCode) => {
          const result = Result.when(false, data, failCode);
          return result.code === failCode;
        }),
        { numRuns: 100 },
      );
    });

    it('For false condition, Result.when() SHALL return null data', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.when(false, data);
          return result.data === null;
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * isSuccess() Property Tests
   */
  describe('isSuccess() Property Tests', () => {
    it('For Result.ok(), isSuccess() SHALL return true', () => {
      fc.assert(
        fc.property(fc.anything(), (data: unknown) => {
          const result = Result.ok(data);
          return result.isSuccess() === true;
        }),
        { numRuns: 100 },
      );
    });

    it('For Result.fail(), isSuccess() SHALL return false', () => {
      const allResponseCodes = Object.values(ResponseCode).filter(
        (value): value is ResponseCode => typeof value === 'number' && value !== 200,
      );

      fc.assert(
        fc.property(fc.constantFrom(...allResponseCodes), (code: ResponseCode) => {
          const result = Result.fail(code);
          return result.isSuccess() === false;
        }),
        { numRuns: 100 },
      );
    });
  });
});
