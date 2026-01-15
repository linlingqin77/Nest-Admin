/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { LoginLogListResponseDto, ClearLogResultResponseDto, UnlockUserResultResponseDto, DeleteLogResultResponseDto, ListLoginlogDto } from './types';

/**
 * 登录日志-列表
 * @description 分页查询登录日志列表
 */
export function fetchLoginlogFindAll(params?: Record<string, unknown>) {
  return apiRequest<LoginLogListResponseDto>({
    method: 'GET',
    url: '/monitor/logininfor/list',
    params,
    operationId: 'LoginlogController_findAll_v1',
  });
}

/**
 * 登录日志-清除全部日志
 * @description 清空所有登录日志记录
 */
export function fetchLoginlogRemoveAll() {
  return apiRequest<ClearLogResultResponseDto>({
    method: 'DELETE',
    url: '/monitor/logininfor/clean',
    operationId: 'LoginlogController_removeAll_v1',
  });
}

/**
 * 登录日志-解锁用户
 * @description 解锁被锁定的用户账号
 */
export function fetchLoginlogUnlock(username: string | number) {
  return apiRequest<UnlockUserResultResponseDto>({
    method: 'GET',
    url: buildUrl('/monitor/logininfor/unlock/{username}', { username }),
    operationId: 'LoginlogController_unlock_v1',
  });
}

/**
 * 登录日志-删除日志
 * @description 批量删除登录日志，多个ID用逗号分隔
 */
export function fetchLoginlogRemove(id: string | number) {
  return apiRequest<DeleteLogResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/logininfor/{id}', { id }),
    operationId: 'LoginlogController_remove_v1',
  });
}

/**
 * 登录日志-导出Excel
 * @description 导出登录日志数据为xlsx文件
 */
export function fetchLoginlogExport(data: ListLoginlogDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/monitor/logininfor/export',
    data,
    operationId: 'LoginlogController_export_v1',
  });
}
