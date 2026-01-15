/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateSmsChannelDto, UpdateSmsChannelDto, SmsChannelListVo, SmsChannelDetailVo } from './types';

/**
 * 短信渠道-创建
 * @description 创建新的短信渠道
 */
export function fetchSmsChannelCreate(data: CreateSmsChannelDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/sms/channel',
    data,
    operationId: 'SmsChannelController_create_v1',
  });
}

/**
 * 短信渠道-更新
 * @description 修改短信渠道信息
 */
export function fetchSmsChannelUpdate(data: UpdateSmsChannelDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/sms/channel',
    data,
    operationId: 'SmsChannelController_update_v1',
  });
}

/**
 * 短信渠道-列表
 * @description 分页查询短信渠道列表
 */
export function fetchSmsChannelFindAll(params?: Record<string, unknown>) {
  return apiRequest<SmsChannelListVo>({
    method: 'GET',
    url: '/system/sms/channel/list',
    params,
    operationId: 'SmsChannelController_findAll_v1',
  });
}

/**
 * 短信渠道-启用列表
 * @description 获取所有启用的短信渠道（用于下拉选择）
 */
export function fetchSmsChannelGetEnabledChannels() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/sms/channel/enabled',
    operationId: 'SmsChannelController_getEnabledChannels_v1',
  });
}

/**
 * 短信渠道-详情
 * @description 根据ID获取短信渠道详情
 */
export function fetchSmsChannelFindOne(id: string | number) {
  return apiRequest<SmsChannelDetailVo>({
    method: 'GET',
    url: buildUrl('/system/sms/channel/{id}', { id }),
    operationId: 'SmsChannelController_findOne_v1',
  });
}

/**
 * 短信渠道-删除
 * @description 批量删除短信渠道，多个ID用逗号分隔
 */
export function fetchSmsChannelRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/sms/channel/{id}', { id }),
    operationId: 'SmsChannelController_remove_v1',
  });
}
