/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { BatchSendSmsDto, SendSmsDto } from './types';

/**
 * 短信发送-单发
 * @description 发送单条短信
 */
export function fetchSmsSendSend(data: SendSmsDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/sms/send',
    data,
    operationId: 'SmsSendController_send_v1'
  });
}

/**
 * 短信发送-批量
 * @description 批量发送短信
 */
export function fetchSmsSendBatchSend(data: BatchSendSmsDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/sms/send/batch',
    data,
    operationId: 'SmsSendController_batchSend_v1'
  });
}

/**
 * 短信发送-重发
 * @description 重发失败的短信
 */
export function fetchSmsSendResend(logId: string | number) {
  return apiRequest<unknown>({
    method: 'POST',
    url: buildUrl('/system/sms/send/resend/{logId}', { logId }),
    operationId: 'SmsSendController_resend_v1'
  });
}
