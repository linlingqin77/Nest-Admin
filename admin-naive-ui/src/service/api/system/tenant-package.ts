import { request } from '@/service/request';

/** 修改租户套餐状态 */
export function fetchUpdateTenantPackageStatus(data: { packageId: CommonType.IdType; status: Api.Common.EnableStatus }) {
  return request<boolean>({
    url: '/system/tenant/package/changeStatus',
    method: 'put',
    data,
  });
}
