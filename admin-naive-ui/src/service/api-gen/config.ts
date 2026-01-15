/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateConfigRequestDto, UpdateConfigRequestDto, ConfigListResponseDto, ConfigResponseDto, ConfigValueResponseDto, ListConfigRequestDto } from './types';

/**
 * 参数设置-创建
 * @description 创建系统参数配置
 */
export function fetchConfigCreate(data: CreateConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/config',
    data,
    operationId: 'ConfigController_create_v1',
  });
}

/**
 * 参数设置-更新
 * @description 修改系统参数配置
 */
export function fetchConfigUpdate(data: UpdateConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/config',
    data,
    operationId: 'ConfigController_update_v1',
  });
}

/**
 * 参数设置-列表
 * @description 分页查询系统参数列表
 */
export function fetchConfigFindAll(params?: Record<string, unknown>) {
  return apiRequest<ConfigListResponseDto>({
    method: 'GET',
    url: '/system/config/list',
    params,
    operationId: 'ConfigController_findAll_v1',
  });
}

/**
 * 参数设置-详情
 * @description 根据ID获取参数详情
 */
export function fetchConfigFindOne(id: string | number) {
  return apiRequest<ConfigResponseDto>({
    method: 'GET',
    url: buildUrl('/system/config/{id}', { id }),
    operationId: 'ConfigController_findOne_v1',
  });
}

/**
 * 参数设置-删除
 * @description 批量删除参数配置，多个ID用逗号分隔
 */
export function fetchConfigRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/config/{id}', { id }),
    operationId: 'ConfigController_remove_v1',
  });
}

/**
 * 参数设置-按Key查询（缓存）
 * @description 根据参数键获取参数值，优先使用缓存
 */
export function fetchConfigFindOneByconfigKey(id: string | number) {
  return apiRequest<ConfigValueResponseDto>({
    method: 'GET',
    url: buildUrl('/system/config/configKey/{id}', { id }),
    operationId: 'ConfigController_findOneByconfigKey_v1',
  });
}

/**
 * 参数设置-按Key更新
 * @description 根据参数键名修改参数值
 */
export function fetchConfigUpdateByKey(data: UpdateConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/config/updateByKey',
    data,
    operationId: 'ConfigController_updateByKey_v1',
  });
}

/**
 * 参数设置-刷新缓存
 * @description 清除并重新加载参数配置缓存
 */
export function fetchConfigRefreshCache() {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: '/system/config/refreshCache',
    operationId: 'ConfigController_refreshCache_v1',
  });
}

/**
 * 参数设置-导出Excel
 * @description 导出参数管理数据为xlsx文件
 */
export function fetchConfigExport(data: ListConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/config/export',
    data,
    operationId: 'ConfigController_export_v1',
  });
}
