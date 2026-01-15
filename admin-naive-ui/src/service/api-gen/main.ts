/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { LoginRequestDto, LoginResponseDto, LogoutResponseDto, RegisterRequestDto, RegisterResultResponseDto, RegisterEnabledResponseDto, CaptchaResponseDto, GetInfoResponseDto, RouterResponseDto } from './types';

/**
 * 用户登录
 * @description 用户登录接口，需要用户名、密码和验证码
 */
export function fetchMainLogin(data: LoginRequestDto) {
  return apiRequest<LoginResponseDto>({
    method: 'POST',
    url: '/login',
    data,
    operationId: 'MainController_login_v1',
  });
}

/**
 * 退出登录
 * @description 退出当前登录状态，清除登录令牌
 */
export function fetchMainLogout() {
  return apiRequest<LogoutResponseDto>({
    method: 'POST',
    url: '/logout',
    operationId: 'MainController_logout_v1',
  });
}

/**
 * 用户注册
 * @description 新用户注册接口，需要用户名、密码和验证码
 */
export function fetchMainRegister(data: RegisterRequestDto) {
  return apiRequest<RegisterResultResponseDto>({
    method: 'POST',
    url: '/register',
    data,
    operationId: 'MainController_register_v1',
  });
}

/**
 * 是否开启用户注册
 * @description 查询系统是否开启用户自主注册功能
 */
export function fetchMainRegisterUser() {
  return apiRequest<RegisterEnabledResponseDto>({
    method: 'GET',
    url: '/registerUser',
    operationId: 'MainController_registerUser_v1',
  });
}

/**
 * 获取验证码图片
 * @description 获取登录/注册所需的图形验证码，返回 Base64 图片和 UUID
 */
export function fetchMainCaptchaImage() {
  return apiRequest<CaptchaResponseDto>({
    method: 'GET',
    url: '/captchaImage',
    operationId: 'MainController_captchaImage_v1',
  });
}

/**
 * 获取当前用户信息
 * @description 获取当前登录用户的基本信息、角色和权限
 */
export function fetchMainGetInfo() {
  return apiRequest<GetInfoResponseDto>({
    method: 'GET',
    url: '/getInfo',
    operationId: 'MainController_getInfo_v1',
  });
}

/**
 * 获取路由菜单
 * @description 获取当前用户的前端路由菜单数据
 */
export function fetchMainGetRouters() {
  return apiRequest<RouterResponseDto[]>({
    method: 'GET',
    url: '/getRouters',
    operationId: 'MainController_getRouters_v1',
  });
}
