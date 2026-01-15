/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { TenantAuditLogListVo, TenantAuditLogDetailVo, TenantAuditLogStatsVo, ExportTenantAuditLogDto } from './types';

/**
 * 审计日志列表
 * @description 分页查询所有租户的审计日志
 */
export function fetchTenantAuditFindAll(params?: Record<string, unknown>) {
  return apiRequest<TenantAuditLogListVo>({
    method: 'GET',
    url: '/system/tenant/audit/list',
    params,
    operationId: 'TenantAuditController_findAll_v1',
  });
}

/**
 * 审计日志详情
 * @description 获取单条审计日志的详细信息，包含操作前后数据变化
 */
export function fetchTenantAuditFindOne(id: string | number) {
  return apiRequest<TenantAuditLogDetailVo>({
    method: 'GET',
    url: buildUrl('/system/tenant/audit/{id}', { id }),
    operationId: 'TenantAuditController_findOne_v1',
  });
}

/**
 * 审计日志统计
 * @description 获取审计日志统计数据
 */
export function fetchTenantAuditGetStats(params?: Record<string, unknown>) {
  return apiRequest<TenantAuditLogStatsVo>({
    method: 'GET',
    url: '/system/tenant/audit/stats/summary',
    params,
    operationId: 'TenantAuditController_getStats_v1',
  });
}

/**
 * 导出审计日志
 * @description 导出审计日志为Excel格式
 */
export function fetchTenantAuditExport(data: ExportTenantAuditLogDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/tenant/audit/export',
    data,
    operationId: 'TenantAuditController_export_v1',
  });
}
