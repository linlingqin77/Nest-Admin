/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { ForceLogoutResultResponseDto, OnlineUserListResponseDto } from './types';

/**
 * 在线用户-列表
 * @description 查询当前在线用户列表
 */
export function fetchOnlineFindAll(params?: Record<string, unknown>) {
  return apiRequest<OnlineUserListResponseDto>({
    method: 'GET',
    url: '/monitor/online/list',
    params,
    operationId: 'OnlineController_findAll_v1'
  });
}

/**
 * 在线用户-强退
 * @description 强制用户下线
 */
export function fetchOnlineDelete(token: string | number) {
  return apiRequest<ForceLogoutResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/online/{token}', { token }),
    operationId: 'OnlineController_delete_v1'
  });
}
