import { request } from '@/service/request';

// ===================== 租户切换 =====================

/** 获取租户选择列表 */
export function fetchGetTenantSelectList() {
  return request<Api.System.TenantSelectItem[]>({
    url: '/auth/tenant/select/list',
    method: 'get'
  });
}

/** 切换租户 */
export function fetchSwitchTenant(tenantId: string) {
  return request<Api.Auth.LoginToken>({
    url: `/auth/tenant/switch/${tenantId}`,
    method: 'get'
  });
}

/** 切换租户 (旧接口) */
export function fetchChangeTenant(tenantId: string) {
  return request<Api.Auth.LoginToken>({
    url: `/auth/tenant/change/${tenantId}`,
    method: 'get'
  });
}

/** 清除租户切换状态 */
export function fetchClearTenant() {
  return request<Api.Auth.LoginToken>({
    url: '/auth/tenant/clear',
    method: 'get'
  });
}

/** 恢复原租户 */
export function fetchRestoreTenant() {
  return request<Api.Auth.LoginToken>({
    url: '/auth/tenant/restore',
    method: 'get'
  });
}

/** 获取租户切换状态 */
export function fetchGetTenantSwitchStatus() {
  return request<Api.System.TenantSwitchStatus>({
    url: '/system/tenant/switch-status',
    method: 'get'
  });
}

// ===================== 租户配额 =====================

/** 获取租户配额列表 */
export function fetchGetTenantQuotaList(params?: Api.System.TenantQuotaSearchParams) {
  return request<Api.System.TenantQuotaList>({
    url: '/system/tenant/quota/list',
    method: 'get',
    params
  });
}

/** 获取租户配额详情 */
export function fetchGetTenantQuotaDetail(tenantId: CommonType.IdType) {
  return request<Api.System.TenantQuota>({
    url: `/system/tenant/quota/${tenantId}`,
    method: 'get'
  });
}

/** 更新租户配额 */
export function fetchUpdateTenantQuota(data: Api.System.UpdateTenantQuotaParams) {
  return request<boolean>({
    url: '/system/tenant/quota',
    method: 'put',
    data
  });
}

// ===================== 租户审计 =====================

/** 获取租户审计日志列表 */
export function fetchGetTenantAuditLogList(params?: Api.System.TenantAuditLogSearchParams) {
  return request<Api.System.TenantAuditLogList>({
    url: '/system/tenant/audit/list',
    method: 'get',
    params
  });
}

/** 获取租户审计日志详情 */
export function fetchGetTenantAuditLogDetail(auditId: CommonType.IdType) {
  return request<Api.System.TenantAuditLog>({
    url: `/system/tenant/audit/${auditId}`,
    method: 'get'
  });
}

/** 导出租户审计日志 */
export function fetchExportTenantAuditLog(params?: Api.System.TenantAuditLogSearchParams) {
  return request<Blob>({
    url: '/system/tenant/audit/export',
    method: 'post',
    data: params,
    responseType: 'blob' as const
  } as any);
}

// ===================== 租户仪表盘 =====================

/** 获取租户仪表盘数据 */
export function fetchGetDashboardData() {
  return request<Api.System.TenantDashboardData>({
    url: '/system/tenant/dashboard',
    method: 'get'
  });
}
