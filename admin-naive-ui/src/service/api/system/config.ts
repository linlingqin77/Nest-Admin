import { request } from '@/service/request';

/** 根据参数键名查询参数值 */
export function fetchGetConfigByKey(configKey: string) {
  return request<string>({
    url: `/system/config/configKey/${configKey}`,
    method: 'get',
  });
}

/** 根据参数键名修改参数值 */
export function fetchUpdateConfigByKey(configKey: string, configValue: string) {
  return request<boolean>({
    url: '/system/config/updateByKey',
    method: 'put',
    data: { configKey, configValue },
  });
}
