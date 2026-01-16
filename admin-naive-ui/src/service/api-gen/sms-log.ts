/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { SmsLogDetailVo, SmsLogListVo } from './types';

/**
 * 短信日志-列表
 * @description 分页查询短信日志列表
 */
export function fetchSmsLogFindAll(params?: Record<string, unknown>) {
  return apiRequest<SmsLogListVo>({
    method: 'GET',
    url: '/system/sms/log/list',
    params,
    operationId: 'SmsLogController_findAll_v1'
  });
}

/**
 * 短信日志-详情
 * @description 根据ID获取短信日志详情
 */
export function fetchSmsLogFindOne(id: string | number) {
  return apiRequest<SmsLogDetailVo>({
    method: 'GET',
    url: buildUrl('/system/sms/log/{id}', { id }),
    operationId: 'SmsLogController_findOne_v1'
  });
}

/**
 * 短信日志-按手机号查询
 * @description 根据手机号查询短信日志
 */
export function fetchSmsLogFindByMobile(mobile: string | number) {
  return apiRequest<unknown>({
    method: 'GET',
    url: buildUrl('/system/sms/log/mobile/{mobile}', { mobile }),
    operationId: 'SmsLogController_findByMobile_v1'
  });
}
