/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';

/**
 */
export function fetchPrometheusIndex() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/metrics',
    operationId: 'PrometheusController_index_v1',
  });
}
