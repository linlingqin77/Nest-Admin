/**
 * API 响应测试数据工厂
 *
 * @description
 * 提供创建 API 响应测试数据的工厂方法
 *
 * @requirements 4.1, 4.2
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
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
  PARAM_INVALID: 1001,
  DATA_NOT_FOUND: 1002,
  TOKEN_INVALID: 2001,
  TOKEN_EXPIRED: 2002
} as const;

/**
 * 创建成功响应 Fixture
 */
export const createSuccessResponse = <T>(data: T, msg = '操作成功'): ApiResponse<T> => ({
  code: ResponseCode.SUCCESS,
  msg,
  data
});

/**
 * 创建分页响应 Fixture
 */
export const createPageResponse = <T>(
  rows: T[],
  total: number,
  pageNum = 1,
  pageSize = 10
): ApiResponse<PaginatedData<T>> => ({
  code: ResponseCode.SUCCESS,
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
 * 创建错误响应 Fixture
 */
export const createErrorResponse = (code: number, msg: string): ApiResponse<null> => ({
  code,
  msg,
  data: null
});

/**
 * 创建未授权响应 Fixture
 */
export const createUnauthorizedResponse = (msg = '未授权，请先登录'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.UNAUTHORIZED, msg);

/**
 * 创建禁止访问响应 Fixture
 */
export const createForbiddenResponse = (msg = '无权访问该资源'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.FORBIDDEN, msg);

/**
 * 创建参数无效响应 Fixture
 */
export const createParamInvalidResponse = (msg = '参数验证失败'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.PARAM_INVALID, msg);

/**
 * 创建数据不存在响应 Fixture
 */
export const createNotFoundResponse = (msg = '数据不存在'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.DATA_NOT_FOUND, msg);

/**
 * 创建 Token 过期响应 Fixture
 */
export const createTokenExpiredResponse = (msg = 'Token 已过期，请重新登录'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.TOKEN_EXPIRED, msg);

/**
 * 登录响应数据类型
 */
export interface LoginResponseData {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * 创建登录成功响应 Fixture
 */
export const createLoginSuccessResponse = (
  token = 'mock-jwt-token-12345',
  expiresIn = 86400
): ApiResponse<LoginResponseData> =>
  createSuccessResponse(
    {
      token,
      refreshToken: 'mock-refresh-token-12345',
      expiresIn
    },
    '登录成功'
  );

/**
 * 创建登录失败响应 Fixture
 */
export const createLoginFailedResponse = (msg = '用户名或密码错误'): ApiResponse<null> =>
  createErrorResponse(ResponseCode.UNAUTHORIZED, msg);

export default {
  createSuccessResponse,
  createPageResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createParamInvalidResponse,
  createNotFoundResponse,
  createTokenExpiredResponse,
  createLoginSuccessResponse,
  createLoginFailedResponse,
  ResponseCode
};
