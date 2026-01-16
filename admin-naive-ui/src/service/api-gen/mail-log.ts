/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { MailLogDetailVo, MailLogListVo } from './types';

/**
 * 邮件日志-列表
 * @description 分页查询邮件日志列表
 */
export function fetchMailLogFindAll(params?: Record<string, unknown>) {
  return apiRequest<MailLogListVo>({
    method: 'GET',
    url: '/system/mail/log/list',
    params,
    operationId: 'MailLogController_findAll_v1'
  });
}

/**
 * 邮件日志-统计
 * @description 获取邮件发送状态统计
 */
export function fetchMailLogGetStats() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/mail/log/stats',
    operationId: 'MailLogController_getStats_v1'
  });
}

/**
 * 邮件日志-详情
 * @description 根据ID获取邮件日志详情
 */
export function fetchMailLogFindOne(id: string | number) {
  return apiRequest<MailLogDetailVo>({
    method: 'GET',
    url: buildUrl('/system/mail/log/{id}', { id }),
    operationId: 'MailLogController_findOne_v1'
  });
}
