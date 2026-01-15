import { request } from '@/service/request';

/** 删除调度日志 - 支持批量删除 */
export function fetchDeleteJobLog(jobLogId: CommonType.IdType | CommonType.IdType[]) {
  return request<boolean>({
    url: `/monitor/jobLog/${Array.isArray(jobLogId) ? jobLogId.join(',') : jobLogId}`,
    method: 'delete',
  });
}
