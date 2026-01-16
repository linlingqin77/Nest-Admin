/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { BatchSendMailDto, SendMailDto, TestMailDto } from './types';

/**
 * 邮件发送-单发
 * @description 使用模板发送单封邮件
 */
export function fetchMailSendSend(data: SendMailDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/mail/send',
    data,
    operationId: 'MailSendController_send_v1'
  });
}

/**
 * 邮件发送-批量
 * @description 使用模板批量发送邮件
 */
export function fetchMailSendBatchSend(data: BatchSendMailDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/mail/send/batch',
    data,
    operationId: 'MailSendController_batchSend_v1'
  });
}

/**
 * 邮件发送-重发
 * @description 重新发送失败的邮件
 */
export function fetchMailSendResend(logId: string | number) {
  return apiRequest<unknown>({
    method: 'POST',
    url: buildUrl('/system/mail/send/resend/{logId}', { logId }),
    operationId: 'MailSendController_resend_v1'
  });
}

/**
 * 邮件发送-测试
 * @description 测试邮箱账号是否可用
 */
export function fetchMailSendTestSend(data: TestMailDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/mail/send/test',
    data,
    operationId: 'MailSendController_testSend_v1'
  });
}
