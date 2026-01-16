/**
 * 断言辅助函数
 *
 * @description
 * 提供 API 响应格式验证的断言辅助函数
 *
 * @requirements 7.1
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  requestId?: string;
  timestamp?: string;
}

/**
 * 分页数据结构
 */
export interface PaginatedData<T = any> {
  rows: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 响应码常量
 */
export const ResponseCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  // 业务错误码
  PARAM_INVALID: 1001,
  DATA_NOT_FOUND: 1002,
  DATA_ALREADY_EXISTS: 1003,
  OPERATION_FAILED: 1004,
  // 认证错误码
  TOKEN_INVALID: 2001,
  TOKEN_EXPIRED: 2002,
  PERMISSION_DENIED: 2003,
  // 用户错误码
  USER_NOT_FOUND: 3001,
  USER_DISABLED: 3002,
  PASSWORD_ERROR: 3003,
} as const;

/**
 * 验证成功响应
 *
 * @param response API 响应对象
 * @param expectedData 期望的数据（可选）
 *
 * @example
 * ```typescript
 * expectSuccessResponse(response.body);
 * expectSuccessResponse(response.body, { userId: 1 });
 * ```
 */
export const expectSuccessResponse = <T = any>(response: ApiResponse<T>, expectedData?: T): void => {
  expect(response).toBeDefined();
  expect(response.code).toBe(ResponseCode.SUCCESS);
  expect(typeof response.msg).toBe('string');

  if (expectedData !== undefined) {
    expect(response.data).toEqual(expectedData);
  }
};

/**
 * 验证分页响应
 *
 * @param response API 响应对象
 * @param options 验证选项
 *
 * @example
 * ```typescript
 * expectPageResponse(response.body);
 * expectPageResponse(response.body, { minTotal: 1, pageNum: 1, pageSize: 10 });
 * ```
 */
export const expectPageResponse = <T = any>(
  response: ApiResponse<PaginatedData<T>>,
  options: {
    minTotal?: number;
    maxTotal?: number;
    pageNum?: number;
    pageSize?: number;
    minRows?: number;
    maxRows?: number;
  } = {},
): void => {
  expect(response).toBeDefined();
  expect(response.code).toBe(ResponseCode.SUCCESS);
  expect(response.data).toBeDefined();

  const { data } = response;

  // 验证分页结构
  expect(data).toHaveProperty('rows');
  expect(data).toHaveProperty('total');
  expect(data).toHaveProperty('pageNum');
  expect(data).toHaveProperty('pageSize');
  expect(data).toHaveProperty('pages');

  // 验证类型
  expect(Array.isArray(data.rows)).toBe(true);
  expect(typeof data.total).toBe('number');
  expect(typeof data.pageNum).toBe('number');
  expect(typeof data.pageSize).toBe('number');
  expect(typeof data.pages).toBe('number');

  // 验证数值范围
  expect(data.total).toBeGreaterThanOrEqual(0);
  expect(data.pageNum).toBeGreaterThanOrEqual(1);
  expect(data.pageSize).toBeGreaterThanOrEqual(1);
  expect(data.pages).toBeGreaterThanOrEqual(0);

  // 验证可选条件
  if (options.minTotal !== undefined) {
    expect(data.total).toBeGreaterThanOrEqual(options.minTotal);
  }
  if (options.maxTotal !== undefined) {
    expect(data.total).toBeLessThanOrEqual(options.maxTotal);
  }
  if (options.pageNum !== undefined) {
    expect(data.pageNum).toBe(options.pageNum);
  }
  if (options.pageSize !== undefined) {
    expect(data.pageSize).toBe(options.pageSize);
  }
  if (options.minRows !== undefined) {
    expect(data.rows.length).toBeGreaterThanOrEqual(options.minRows);
  }
  if (options.maxRows !== undefined) {
    expect(data.rows.length).toBeLessThanOrEqual(options.maxRows);
  }

  // 验证分页逻辑一致性
  const expectedPages = data.pageSize > 0 ? Math.ceil(data.total / data.pageSize) : 0;
  expect(data.pages).toBe(expectedPages);
};

/**
 * 验证错误响应
 *
 * @param response API 响应对象
 * @param expectedCode 期望的错误码
 * @param expectedMsgPattern 期望的错误消息模式（可选）
 *
 * @example
 * ```typescript
 * expectErrorResponse(response.body, ResponseCode.PARAM_INVALID);
 * expectErrorResponse(response.body, ResponseCode.USER_NOT_FOUND, /用户不存在/);
 * ```
 */
export const expectErrorResponse = (
  response: ApiResponse,
  expectedCode: number,
  expectedMsgPattern?: RegExp | string,
): void => {
  expect(response).toBeDefined();
  expect(response.code).toBe(expectedCode);
  expect(typeof response.msg).toBe('string');
  expect(response.msg.length).toBeGreaterThan(0);

  if (expectedMsgPattern) {
    if (typeof expectedMsgPattern === 'string') {
      expect(response.msg).toContain(expectedMsgPattern);
    } else {
      expect(response.msg).toMatch(expectedMsgPattern);
    }
  }
};

/**
 * 验证未授权响应
 *
 * @param response API 响应对象
 */
export const expectUnauthorizedResponse = (response: ApiResponse): void => {
  expectErrorResponse(response, ResponseCode.UNAUTHORIZED);
};

/**
 * 验证禁止访问响应
 *
 * @param response API 响应对象
 */
export const expectForbiddenResponse = (response: ApiResponse): void => {
  expectErrorResponse(response, ResponseCode.FORBIDDEN);
};

/**
 * 验证参数无效响应
 *
 * @param response API 响应对象
 * @param fieldName 无效字段名（可选）
 */
export const expectParamInvalidResponse = (response: ApiResponse, fieldName?: string): void => {
  expectErrorResponse(response, ResponseCode.PARAM_INVALID, fieldName ? new RegExp(fieldName) : undefined);
};

/**
 * 验证数据不存在响应
 *
 * @param response API 响应对象
 */
export const expectNotFoundResponse = (response: ApiResponse): void => {
  expectErrorResponse(response, ResponseCode.DATA_NOT_FOUND);
};

/**
 * 验证响应结构完整性
 *
 * @param response API 响应对象
 */
export const expectValidResponseStructure = (response: ApiResponse): void => {
  expect(response).toBeDefined();
  expect(response).toHaveProperty('code');
  expect(response).toHaveProperty('msg');
  expect(response).toHaveProperty('data');

  expect(typeof response.code).toBe('number');
  expect(typeof response.msg).toBe('string');
};

/**
 * 验证数组响应
 *
 * @param response API 响应对象
 * @param options 验证选项
 */
export const expectArrayResponse = <T = any>(
  response: ApiResponse<T[]>,
  options: {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: T) => void;
  } = {},
): void => {
  expectSuccessResponse(response);
  expect(Array.isArray(response.data)).toBe(true);

  if (options.minLength !== undefined) {
    expect(response.data.length).toBeGreaterThanOrEqual(options.minLength);
  }
  if (options.maxLength !== undefined) {
    expect(response.data.length).toBeLessThanOrEqual(options.maxLength);
  }
  if (options.itemValidator) {
    response.data.forEach(options.itemValidator);
  }
};

/**
 * 验证对象响应包含指定字段
 *
 * @param response API 响应对象
 * @param requiredFields 必需字段列表
 */
export const expectResponseHasFields = (response: ApiResponse<Record<string, any>>, requiredFields: string[]): void => {
  expectSuccessResponse(response);
  expect(response.data).toBeDefined();

  requiredFields.forEach((field) => {
    expect(response.data).toHaveProperty(field);
  });
};

/**
 * 验证响应不包含敏感字段
 *
 * @param response API 响应对象
 * @param sensitiveFields 敏感字段列表
 */
export const expectNoSensitiveFields = (
  response: ApiResponse<Record<string, any>>,
  sensitiveFields: string[] = ['password', 'salt', 'secret'],
): void => {
  const checkObject = (obj: any, path = ''): void => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (sensitiveFields.includes(key)) {
          throw new Error(`响应包含敏感字段: ${currentPath}`);
        }
        if (typeof obj[key] === 'object') {
          checkObject(obj[key], currentPath);
        }
      });
    }
  };

  checkObject(response.data);
};

export default {
  expectSuccessResponse,
  expectPageResponse,
  expectErrorResponse,
  expectUnauthorizedResponse,
  expectForbiddenResponse,
  expectParamInvalidResponse,
  expectNotFoundResponse,
  expectValidResponseStructure,
  expectArrayResponse,
  expectResponseHasFields,
  expectNoSensitiveFields,
  ResponseCode,
};
