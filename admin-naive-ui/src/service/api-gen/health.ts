/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';

/**
 * 综合健康检查
 */
export function fetchHealthCheck() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health',
    operationId: 'HealthController_check_v1',
  });
}

/**
 * 存活探针 (Kubernetes Liveness Probe)
 */
export function fetchHealthCheckLive() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health/live',
    operationId: 'HealthController_checkLive_v1',
  });
}

/**
 * 存活探针 (Kubernetes Liveness Probe) - 别名
 */
export function fetchHealthCheckLiveness() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health/liveness',
    operationId: 'HealthController_checkLiveness_v1',
  });
}

/**
 * 就绪探针 (Kubernetes Readiness Probe)
 */
export function fetchHealthCheckReady() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health/ready',
    operationId: 'HealthController_checkReady_v1',
  });
}

/**
 * 就绪探针 (Kubernetes Readiness Probe) - 别名
 */
export function fetchHealthCheckReadiness() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health/readiness',
    operationId: 'HealthController_checkReadiness_v1',
  });
}

/**
 * 应用信息
 */
export function fetchHealthGetInfo() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/health/info',
    operationId: 'HealthController_getInfo_v1',
  });
}
