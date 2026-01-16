/**
 * 测试辅助函数索引
 *
 * @description
 * 导出所有测试辅助函数，方便统一导入
 */

// 测试应用辅助函数
export {
  createTestApp,
  getAuthToken,
  getAdminToken,
  getUserToken,
  createAuthenticatedRequest,
  closeTestApp,
  type TestAppOptions,
  type LoginCredentials,
} from './test-app.helper';

// 断言辅助函数
export {
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
  type ApiResponse,
  type PaginatedData,
} from './assertion.helper';

// 数据清理辅助函数
export {
  cleanupTestData,
  cleanupUserData,
  cleanupRoleData,
  cleanupTenantData,
  resetDatabase,
  createCleanupFunction,
  TestDataTracker,
  type CleanupOptions,
} from './cleanup.helper';

// 租户测试辅助函数
export {
  TenantTestHelper,
  runWithTenant,
  runWithTenantAsync,
  runIgnoringTenant,
  runIgnoringTenantAsync,
  runAsSuperTenant,
  runAsSuperTenantAsync,
  createTestTenant,
  createTestUser,
  createTestQuota,
  createTenantTestHelper,
  createTenantMockPrisma,
  createTenantMockRedis,
  createTenantMockConfig,
  createMockAppConfigService,
  generateRandomTenantId,
  generateNormalTenantId,
  generateTenantIdPair,
  SUPER_TENANT_ID,
  type TenantTestConfig,
  type TenantTestData,
  type UserTestData,
  type QuotaTestData,
} from './tenant-test.helper';
