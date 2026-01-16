/**
 * 前端测试 Fixture 索引
 *
 * @description
 * 导出所有前端测试 Fixture
 */

// 用户 Fixture
export {
  createUserFixture,
  createUserListFixture,
  createAdminUserFixture,
  createDisabledUserFixture,
  resetUserIdCounter,
  type UserInfo,
  type RoleInfo,
  type UserFixtureOptions
} from './user.fixture';

// API 响应 Fixture
export {
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
  ResponseCode,
  type ApiResponse,
  type PaginatedData,
  type LoginResponseData
} from './api-response.fixture';
