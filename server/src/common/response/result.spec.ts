import { Result, SUCCESS_CODE } from './result';
import { ResponseCode } from './response.interface';

describe('Result', () => {
  describe('constructor', () => {
    it('should create result with all parameters', () => {
      const result = new Result(200, 'success', { id: 1 }, 'req-123', '2025-01-01');
      
      expect(result.code).toBe(200);
      expect(result.msg).toBe('success');
      expect(result.data).toEqual({ id: 1 });
      expect(result.requestId).toBe('req-123');
      expect(result.timestamp).toBe('2025-01-01');
    });

    it('should create result with default null data', () => {
      const result = new Result(200, 'success');
      expect(result.data).toBeNull();
    });
  });

  describe('isSuccess', () => {
    it('should return true for success code', () => {
      const result = Result.ok({ id: 1 });
      expect(result.isSuccess()).toBe(true);
    });

    it('should return false for error code', () => {
      const result = Result.fail(ResponseCode.BUSINESS_ERROR);
      expect(result.isSuccess()).toBe(false);
    });
  });

  describe('ok', () => {
    it('should create success result with data', () => {
      const result = Result.ok({ name: 'test' });
      
      expect(result.code).toBe(ResponseCode.SUCCESS);
      expect(result.data).toEqual({ name: 'test' });
    });

    it('should create success result with custom message', () => {
      const result = Result.ok(null, '创建成功');
      
      expect(result.msg).toBe('创建成功');
    });

    it('should create success result without data', () => {
      const result = Result.ok();
      
      expect(result.code).toBe(ResponseCode.SUCCESS);
      expect(result.data).toBeNull();
    });

    it('should use default success message', () => {
      const result = Result.ok({ id: 1 });
      expect(result.msg).toBe('操作成功');
    });
  });

  describe('fail', () => {
    it('should create fail result with code', () => {
      const result = Result.fail(ResponseCode.PARAM_INVALID);
      
      expect(result.code).toBe(ResponseCode.PARAM_INVALID);
    });

    it('should create fail result with custom message', () => {
      const result = Result.fail(ResponseCode.BUSINESS_ERROR, '自定义错误');
      
      expect(result.msg).toBe('自定义错误');
    });

    it('should create fail result with data', () => {
      const result = Result.fail(ResponseCode.BUSINESS_ERROR, '错误', { field: 'name' });
      
      expect(result.data).toEqual({ field: 'name' });
    });

    it('should use default error code', () => {
      const result = Result.fail();
      expect(result.code).toBe(ResponseCode.BUSINESS_ERROR);
    });

    it('should use default message for unknown code', () => {
      const result = Result.fail(99999);
      expect(result.msg).toBe('操作失败');
    });
  });

  describe('page', () => {
    it('should create paginated result', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const result = Result.page(rows, 100, 1, 10);
      
      expect(result.code).toBe(ResponseCode.SUCCESS);
      expect(result.data.rows).toEqual(rows);
      expect(result.data.total).toBe(100);
      expect(result.data.pageNum).toBe(1);
      expect(result.data.pageSize).toBe(10);
      expect(result.data.pages).toBe(10);
    });

    it('should calculate pages correctly', () => {
      const result = Result.page([], 25, 1, 10);
      expect(result.data.pages).toBe(3);
    });

    it('should handle empty rows', () => {
      const result = Result.page([], 0, 1, 10);
      
      expect(result.data.rows).toEqual([]);
      expect(result.data.total).toBe(0);
    });

    it('should handle undefined pageSize', () => {
      const result = Result.page([{ id: 1 }], 1);
      expect(result.data.pages).toBeUndefined();
    });
  });

  describe('when', () => {
    it('should return success when condition is true', () => {
      const result = Result.when(true, { id: 1 });
      
      expect(result.code).toBe(ResponseCode.SUCCESS);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should return fail when condition is false', () => {
      const result = Result.when(false, null, ResponseCode.DATA_NOT_FOUND, '数据不存在');
      
      expect(result.code).toBe(ResponseCode.DATA_NOT_FOUND);
      expect(result.msg).toBe('数据不存在');
    });

    it('should use default fail code', () => {
      const result = Result.when(false, null);
      expect(result.code).toBe(ResponseCode.OPERATION_FAILED);
    });
  });

  describe('fromPromise', () => {
    it('should return success for resolved promise', async () => {
      const promise = Promise.resolve({ id: 1 });
      const result = await Result.fromPromise(promise);
      
      expect(result.code).toBe(ResponseCode.SUCCESS);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should return fail for rejected promise with Error', async () => {
      const promise = Promise.reject(new Error('Something went wrong'));
      const result = await Result.fromPromise(promise);
      
      expect(result.code).toBe(ResponseCode.OPERATION_FAILED);
      expect(result.msg).toBe('Something went wrong');
    });

    it('should return fail for rejected promise with non-Error', async () => {
      const promise = Promise.reject('string error');
      const result = await Result.fromPromise(promise);
      
      expect(result.code).toBe(ResponseCode.OPERATION_FAILED);
      expect(result.msg).toBe('操作失败');
    });

    it('should use custom fail code', async () => {
      const promise = Promise.reject(new Error('error'));
      const result = await Result.fromPromise(promise, ResponseCode.SERVICE_UNAVAILABLE);
      
      expect(result.code).toBe(ResponseCode.SERVICE_UNAVAILABLE);
    });
  });

  describe('SUCCESS_CODE', () => {
    it('should equal ResponseCode.SUCCESS', () => {
      expect(SUCCESS_CODE).toBe(ResponseCode.SUCCESS);
    });
  });
});
