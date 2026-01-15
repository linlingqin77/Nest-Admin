/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateTenantPackageRequestDto, UpdateTenantPackageRequestDto, TenantPackageListResponseDto, TenantPackageSelectResponseDto, TenantPackageResponseDto, ListTenantPackageRequestDto } from './types';

/**
 * 租户套餐管理-创建
 * @description 创建新租户套餐
 */
export function fetchTenantPackageCreate(data: CreateTenantPackageRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/tenant/package',
    data,
    operationId: 'TenantPackageController_create_v1',
  });
}

/**
 * 租户套餐管理-更新
 * @description 修改租户套餐信息
 */
export function fetchTenantPackageUpdate(data: UpdateTenantPackageRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/tenant/package',
    data,
    operationId: 'TenantPackageController_update_v1',
  });
}

/**
 * 租户套餐管理-列表
 * @description 分页查询租户套餐列表
 */
export function fetchTenantPackageFindAll(params?: Record<string, unknown>) {
  return apiRequest<TenantPackageListResponseDto>({
    method: 'GET',
    url: '/system/tenant/package/list',
    params,
    operationId: 'TenantPackageController_findAll_v1',
  });
}

/**
 * 租户套餐管理-选择框列表
 * @description 获取租户套餐选择框列表
 */
export function fetchTenantPackageSelectList() {
  return apiRequest<TenantPackageSelectResponseDto[]>({
    method: 'GET',
    url: '/system/tenant/package/selectList',
    operationId: 'TenantPackageController_selectList_v1',
  });
}

/**
 * 租户套餐管理-详情
 * @description 根据ID获取租户套餐详情
 */
export function fetchTenantPackageFindOne(id: string | number) {
  return apiRequest<TenantPackageResponseDto>({
    method: 'GET',
    url: buildUrl('/system/tenant/package/{id}', { id }),
    operationId: 'TenantPackageController_findOne_v1',
  });
}

/**
 * 租户套餐管理-删除
 * @description 批量删除租户套餐
 */
export function fetchTenantPackageRemove(ids: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/tenant/package/{ids}', { ids }),
    operationId: 'TenantPackageController_remove_v1',
  });
}

/**
 * 租户套餐管理-导出
 * @description 导出租户套餐数据为Excel文件
 */
export function fetchTenantPackageExport(data: ListTenantPackageRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/tenant/package/export',
    data,
    operationId: 'TenantPackageController_export_v1',
  });
}
