/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';

/**
 * SSE连接
 */
export function fetchSseSse(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/resource/sse',
    params,
    operationId: 'SseController_sse_v1'
  });
}

/**
 * 关闭SSE连接
 */
export function fetchSseCloseSse() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/resource/sse/close',
    operationId: 'SseController_closeSse_v1'
  });
}

/**
 * 发送消息给指定用户
 */
export function fetchSseSendMessage() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/resource/sse/send',
    operationId: 'SseController_sendMessage_v1'
  });
}

/**
 * 广播消息给所有用户
 */
export function fetchSseBroadcast() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/resource/sse/broadcast',
    operationId: 'SseController_broadcast_v1'
  });
}

/**
 * 获取在线连接数
 */
export function fetchSseGetCount() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/resource/sse/count',
    operationId: 'SseController_getCount_v1'
  });
}
