/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { TenantQuotaListVo, TenantQuotaDetailVo, UpdateTenantQuotaDto, CheckQuotaDto, QuotaCheckResultVo } from './types';

/**
 * 租户配额列表
 * @description 分页查询所有租户的配额使用情况
 */
export function fetchTenantQuotaFindAll(params?: Record<string, unknown>) {
  return apiRequest<TenantQuotaListVo>({
    method: 'GET',
    url: '/system/tenant/quota/list',
    params,
    operationId: 'TenantQuotaController_findAll_v1',
  });
}

/**
 * 租户配额详情
 * @description 获取单个租户的配额详情，包含变更历史
 */
export function fetchTenantQuotaFindOne(tenantId: string | number) {
  return apiRequest<TenantQuotaDetailVo>({
    method: 'GET',
    url: buildUrl('/system/tenant/quota/{tenantId}', { tenantId }),
    operationId: 'TenantQuotaController_findOne_v1',
  });
}

/**
 * 更新租户配额
 * @description 修改租户的配额限制值
 */
export function fetchTenantQuotaUpdate(data: UpdateTenantQuotaDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/tenant/quota',
    data,
    operationId: 'TenantQuotaController_update_v1',
  });
}

/**
 * 检查配额
 * @description 检查指定租户的配额是否允许操作
 */
export function fetchTenantQuotaCheckQuota(data: CheckQuotaDto) {
  return apiRequest<QuotaCheckResultVo>({
    method: 'POST',
    url: '/system/tenant/quota/check',
    data,
    operationId: 'TenantQuotaController_checkQuota_v1',
  });
}
