/**
 * @generated - 此文件为 API 生成基础设施
 * API 自定义配置文件
 *
 * 用于定义特定 API 的自定义请求配置，如加密、防重复提交等
 * 配置会在请求时自动应用到对应的 API
 */

/**
 * API 自定义配置接口
 */
export interface ApiCustomConfig {
  /** 是否需要加密请求数据 */
  isEncrypt?: boolean;
  /** 是否防止重复提交 */
  repeatSubmit?: boolean;
  /** 是否需要携带 token */
  isToken?: boolean;
}

/**
 * API 自定义配置映射
 *
 * key: operationId（与 OpenAPI 规范中的 operationId 对应）
 * value: 自定义配置
 *
 * 示例：
 * - 登录接口需要加密，不需要 token
 * - 注册接口需要加密，不需要 token
 * - 重置密码需要加密
 */
export const apiCustomConfigs: Record<string, ApiCustomConfig> = {
  // ==================== 认证模块 ====================

  // 登录接口 - 需要加密，不需要 token，防止重复提交
  AuthController_login_v1: {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false
  },

  // 注册接口 - 需要加密，不需要 token，防止重复提交
  AuthController_register_v1: {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false
  },

  MainController_register_v1: {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false
  },

  // 获取验证码 - 不需要 token
  AuthController_getCaptchaCode_v1: {
    isToken: false
  },

  // 获取租户列表 - 不需要 token
  AuthController_getTenantList_v1: {
    isToken: false
  },

  // 获取验证码图片 - 不需要 token
  MainController_captchaImage_v1: {
    isToken: false
  },

  // 是否开启用户注册 - 不需要 token
  MainController_registerUser_v1: {
    isToken: false
  },

  // 登录接口（主模块）- 需要加密，不需要 token
  MainController_login_v1: {
    isEncrypt: true,
    repeatSubmit: false,
    isToken: false
  },

  // ==================== 用户模块 ====================

  // 重置用户密码 - 需要加密，防止重复提交
  UserController_resetPwd_v1: {
    isEncrypt: true,
    repeatSubmit: false
  },

  // 修改用户密码 - 需要加密
  UserController_updatePwd_v1: {
    isEncrypt: true
  },

  // 创建用户 - 需要加密（密码字段）
  UserController_create_v1: {
    isEncrypt: true,
    repeatSubmit: false
  }

  // ==================== 其他需要特殊配置的接口 ====================
  // 可以根据需要继续添加...
};

/**
 * 获取 API 自定义配置
 * @param operationId 操作 ID
 * @returns 自定义配置，如果不存在则返回空对象
 */
export function getApiConfig(operationId: string): ApiCustomConfig {
  return apiCustomConfigs[operationId] || {};
}

/**
 * 检查 API 是否需要加密
 * @param operationId 操作 ID
 */
export function isApiEncrypted(operationId: string): boolean {
  return apiCustomConfigs[operationId]?.isEncrypt === true;
}

/**
 * 检查 API 是否需要 token
 * @param operationId 操作 ID
 */
export function isApiRequireToken(operationId: string): boolean {
  const config = apiCustomConfigs[operationId];
  // 默认需要 token，除非明确配置为 false
  return config?.isToken !== false;
}
