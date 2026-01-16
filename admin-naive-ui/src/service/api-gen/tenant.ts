/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  CreateTenantRequestDto,
  CreateTenantResultResponseDto,
  DeleteTenantResultResponseDto,
  ListTenantRequestDto,
  SyncTenantConfigResultResponseDto,
  SyncTenantDictResultResponseDto,
  SyncTenantPackageResultResponseDto,
  TenantListResponseDto,
  TenantResponseDto,
  TenantRestoreResponseDto,
  TenantSelectListResponseDto,
  TenantSwitchResponseDto,
  TenantSwitchStatusResponseDto,
  UpdateTenantRequestDto,
  UpdateTenantResultResponseDto
} from './types';

/**
 * 租户管理-创建
 * @description 创建新租户并创建租户管理员账号
 */
export function fetchTenantCreate(data: CreateTenantRequestDto) {
  return apiRequest<CreateTenantResultResponseDto>({
    method: 'POST',
    url: '/system/tenant',
    data,
    operationId: 'TenantController_create_v1'
  });
}

/**
 * 租户管理-更新
 * @description 修改租户信息
 */
export function fetchTenantUpdate(data: UpdateTenantRequestDto) {
  return apiRequest<UpdateTenantResultResponseDto>({
    method: 'PUT',
    url: '/system/tenant',
    data,
    operationId: 'TenantController_update_v1'
  });
}

/**
 * 租户管理-列表
 * @description 分页查询租户列表
 */
export function fetchTenantFindAll(params?: Record<string, unknown>) {
  return apiRequest<TenantListResponseDto>({
    method: 'GET',
    url: '/system/tenant/list',
    params,
    operationId: 'TenantController_findAll_v1'
  });
}

/**
 * 租户管理-同步租户字典
 * @description 将超级管理员的字典数据同步到所有租户
 */
export function fetchTenantSyncTenantDict() {
  return apiRequest<SyncTenantDictResultResponseDto>({
    method: 'GET',
    url: '/system/tenant/syncTenantDict',
    operationId: 'TenantController_syncTenantDict_v1'
  });
}

/**
 * 租户管理-同步租户套餐
 * @description 同步租户套餐菜单权限
 */
export function fetchTenantSyncTenantPackage(params?: Record<string, unknown>) {
  return apiRequest<SyncTenantPackageResultResponseDto>({
    method: 'GET',
    url: '/system/tenant/syncTenantPackage',
    params,
    operationId: 'TenantController_syncTenantPackage_v1'
  });
}

/**
 * 租户管理-同步租户配置
 * @description 将超级管理员的配置同步到所有租户
 */
export function fetchTenantSyncTenantConfig() {
  return apiRequest<SyncTenantConfigResultResponseDto>({
    method: 'GET',
    url: '/system/tenant/syncTenantConfig',
    operationId: 'TenantController_syncTenantConfig_v1'
  });
}

/**
 * 租户管理-可切换租户列表
 * @description 获取可切换的租户列表（仅超级管理员可用）
 */
export function fetchTenantGetSelectList() {
  return apiRequest<TenantSelectListResponseDto>({
    method: 'GET',
    url: '/system/tenant/select-list',
    operationId: 'TenantController_getSelectList_v1'
  });
}

/**
 * 租户管理-获取切换状态
 * @description 获取当前租户切换状态
 */
export function fetchTenantGetSwitchStatus() {
  return apiRequest<TenantSwitchStatusResponseDto>({
    method: 'GET',
    url: '/system/tenant/switch-status',
    operationId: 'TenantController_getSwitchStatus_v1'
  });
}

/**
 * 租户管理-切换租户
 * @description 切换到指定租户（仅超级管理员可用）
 */
export function fetchTenantSwitchTenant(tenantId: string | number) {
  return apiRequest<TenantSwitchResponseDto>({
    method: 'GET',
    url: buildUrl('/system/tenant/dynamic/{tenantId}', { tenantId }),
    operationId: 'TenantController_switchTenant_v1'
  });
}

/**
 * 租户管理-恢复原租户
 * @description 清除租户切换状态，恢复到原租户
 */
export function fetchTenantRestoreTenant() {
  return apiRequest<TenantRestoreResponseDto>({
    method: 'GET',
    url: '/system/tenant/dynamic/clear',
    operationId: 'TenantController_restoreTenant_v1'
  });
}

/**
 * 租户管理-详情
 * @description 根据ID获取租户详情
 */
export function fetchTenantFindOne(id: string | number) {
  return apiRequest<TenantResponseDto>({
    method: 'GET',
    url: buildUrl('/system/tenant/{id}', { id }),
    operationId: 'TenantController_findOne_v1'
  });
}

/**
 * 租户管理-删除
 * @description 批量删除租户
 */
export function fetchTenantRemove(ids: string | number) {
  return apiRequest<DeleteTenantResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/tenant/{ids}', { ids }),
    operationId: 'TenantController_remove_v1'
  });
}

/**
 * 租户管理-导出
 * @description 导出租户数据为Excel文件
 */
export function fetchTenantExport(data: ListTenantRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/tenant/export',
    data,
    operationId: 'TenantController_export_v1'
  });
}
