/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  DashboardDataVo,
  ExpiringTenantVo,
  PackageDistributionVo,
  QuotaTopTenantVo,
  TenantStatsVo,
  TenantTrendDataVo
} from './types';

/**
 * 租户仪表盘-统计数据
 * @description 获取租户总数、活跃数、用户数等统计卡片数据
 */
export function fetchTenantDashboardGetStats() {
  return apiRequest<TenantStatsVo>({
    method: 'GET',
    url: '/system/tenant/dashboard/stats',
    operationId: 'TenantDashboardController_getStats_v1'
  });
}

/**
 * 租户仪表盘-增长趋势
 * @description 获取指定时间范围内的租户增长趋势数据
 */
export function fetchTenantDashboardGetTrend(params?: Record<string, unknown>) {
  return apiRequest<TenantTrendDataVo[]>({
    method: 'GET',
    url: '/system/tenant/dashboard/trend',
    params,
    operationId: 'TenantDashboardController_getTrend_v1'
  });
}

/**
 * 租户仪表盘-套餐分布
 * @description 获取租户套餐分布饼图数据
 */
export function fetchTenantDashboardGetPackageDistribution() {
  return apiRequest<PackageDistributionVo[]>({
    method: 'GET',
    url: '/system/tenant/dashboard/package-distribution',
    operationId: 'TenantDashboardController_getPackageDistribution_v1'
  });
}

/**
 * 租户仪表盘-即将到期租户
 * @description 获取指定天数内即将到期的租户列表
 */
export function fetchTenantDashboardGetExpiringTenants(params?: Record<string, unknown>) {
  return apiRequest<ExpiringTenantVo[]>({
    method: 'GET',
    url: '/system/tenant/dashboard/expiring-tenants',
    params,
    operationId: 'TenantDashboardController_getExpiringTenants_v1'
  });
}

/**
 * 租户仪表盘-配额使用TOP10
 * @description 获取配额使用率最高的10个租户
 */
export function fetchTenantDashboardGetQuotaTopTenants() {
  return apiRequest<QuotaTopTenantVo[]>({
    method: 'GET',
    url: '/system/tenant/dashboard/quota-top',
    operationId: 'TenantDashboardController_getQuotaTopTenants_v1'
  });
}

/**
 * 租户仪表盘-完整数据
 * @description 获取仪表盘所有数据（统计、趋势、分布、到期列表、TOP10）
 */
export function fetchTenantDashboardGetDashboardData(params?: Record<string, unknown>) {
  return apiRequest<DashboardDataVo>({
    method: 'GET',
    url: '/system/tenant/dashboard',
    params,
    operationId: 'TenantDashboardController_getDashboardData_v1'
  });
}
