/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  NotifyMessageDetailVo,
  NotifyMessageListVo,
  SendNotifyAllDto,
  SendNotifyMessageDto,
  UnreadCountVo
} from './types';

/**
 * 站内信-发送
 * @description 发送站内信给指定用户（单发/群发）
 */
export function fetchNotifyMessageSend(data: SendNotifyMessageDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/notify/message/send',
    data,
    operationId: 'NotifyMessageController_send_v1'
  });
}

/**
 * 站内信-群发所有用户
 * @description 发送站内信给所有用户
 */
export function fetchNotifyMessageSendAll(data: SendNotifyAllDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/notify/message/send-all',
    data,
    operationId: 'NotifyMessageController_sendAll_v1'
  });
}

/**
 * 站内信-列表（管理员）
 * @description 分页查询所有站内信消息列表
 */
export function fetchNotifyMessageFindAll(params?: Record<string, unknown>) {
  return apiRequest<NotifyMessageListVo>({
    method: 'GET',
    url: '/system/notify/message/list',
    params,
    operationId: 'NotifyMessageController_findAll_v1'
  });
}

/**
 * 站内信-我的消息列表
 * @description 分页查询当前用户的站内信列表
 */
export function fetchNotifyMessageFindMyMessages(params?: Record<string, unknown>) {
  return apiRequest<NotifyMessageListVo>({
    method: 'GET',
    url: '/system/notify/message/my-list',
    params,
    operationId: 'NotifyMessageController_findMyMessages_v1'
  });
}

/**
 * 站内信-未读数量
 * @description 获取当前用户的未读站内信数量
 */
export function fetchNotifyMessageGetUnreadCount() {
  return apiRequest<UnreadCountVo>({
    method: 'GET',
    url: '/system/notify/message/unread-count',
    operationId: 'NotifyMessageController_getUnreadCount_v1'
  });
}

/**
 * 站内信-最近消息
 * @description 获取当前用户最近的站内信列表（用于通知铃铛下拉）
 */
export function fetchNotifyMessageGetRecentMessages(params?: Record<string, unknown>) {
  return apiRequest<NotifyMessageListVo>({
    method: 'GET',
    url: '/system/notify/message/recent',
    params,
    operationId: 'NotifyMessageController_getRecentMessages_v1'
  });
}

/**
 * 站内信-详情
 * @description 根据ID获取站内信详情
 */
export function fetchNotifyMessageFindOne(id: string | number) {
  return apiRequest<NotifyMessageDetailVo>({
    method: 'GET',
    url: buildUrl('/system/notify/message/{id}', { id }),
    operationId: 'NotifyMessageController_findOne_v1'
  });
}

/**
 * 站内信-删除
 * @description 删除单条站内信（软删除）
 */
export function fetchNotifyMessageRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/notify/message/{id}', { id }),
    operationId: 'NotifyMessageController_remove_v1'
  });
}

/**
 * 站内信-标记已读
 * @description 标记单条站内信为已读
 */
export function fetchNotifyMessageMarkAsRead(id: string | number) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: buildUrl('/system/notify/message/read/{id}', { id }),
    operationId: 'NotifyMessageController_markAsRead_v1'
  });
}

/**
 * 站内信-批量标记已读
 * @description 批量标记站内信为已读，多个ID用逗号分隔
 */
export function fetchNotifyMessageMarkAsReadBatch(ids: string | number) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: buildUrl('/system/notify/message/read-batch/{ids}', { ids }),
    operationId: 'NotifyMessageController_markAsReadBatch_v1'
  });
}

/**
 * 站内信-全部标记已读
 * @description 标记当前用户所有站内信为已读
 */
export function fetchNotifyMessageMarkAllAsRead() {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/notify/message/read-all',
    operationId: 'NotifyMessageController_markAllAsRead_v1'
  });
}

/**
 * 站内信-批量删除
 * @description 批量删除站内信（软删除），多个ID用逗号分隔
 */
export function fetchNotifyMessageRemoveBatch(ids: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/notify/message/batch/{ids}', { ids }),
    operationId: 'NotifyMessageController_removeBatch_v1'
  });
}
