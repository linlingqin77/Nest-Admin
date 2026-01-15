import { request } from '@/service/request';

/** 获取通知消息列表 */
export function fetchGetNotifyList(params?: Api.System.NotifyMessageSearchParams) {
  return request<Api.System.NotifyMessageList>({
    url: '/system/notify/message/list',
    method: 'get',
    params,
  });
}

/** 获取最近消息 */
export function fetchGetRecentMessages() {
  return request<Api.System.NotifyMessage[]>({
    url: '/system/notify/message/recent',
    method: 'get',
  });
}

/** 获取未读消息数量 */
export function fetchGetUnreadCount() {
  return request<number>({
    url: '/system/notify/message/unread-count',
    method: 'get',
  });
}

/** 标记消息为已读 */
export function fetchMarkAsRead(ids: CommonType.IdType[]) {
  return request<boolean>({
    url: '/system/notify/message/read',
    method: 'put',
    data: { ids },
  });
}

/** 标记所有消息为已读 */
export function fetchMarkAllAsRead() {
  return request<boolean>({
    url: '/system/notify/message/read-all',
    method: 'put',
  });
}
