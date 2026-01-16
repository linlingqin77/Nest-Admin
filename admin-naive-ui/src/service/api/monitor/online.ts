import { request } from '@/service/request';

/**
 * 强退当前在线设备
 *
 * @param tokenId - 令牌ID
 */
export function fetchKickOutCurrentDevice(tokenId: string) {
  return request<boolean>({
    url: `/monitor/online/myself/${tokenId}`,
    method: 'delete'
  });
}

/** 获取在线设备列表 */
export function fetchGetOnlineDeviceList(params?: Api.Monitor.OnlineUserSearchParams) {
  return request<Api.Monitor.OnlineUserList>({
    url: '/monitor/online',
    method: 'get',
    params
  });
}
