import { request } from '@/service/request';

/** 修改定时任务 - 生成的 API 缺少 data 参数 */
export function fetchUpdateJob(data: Api.Monitor.JobOperateParams) {
  return request<boolean>({
    url: '/monitor/job',
    method: 'put',
    data,
  });
}

/** 修改定时任务状态 - 生成的 API 缺少 data 参数 */
export function fetchChangeJobStatus(jobId: CommonType.IdType, status: Api.Common.EnableStatus) {
  return request<boolean>({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data: { jobId, status },
  });
}

/** 立即执行一次定时任务 - 生成的 API 缺少 data 参数 */
export function fetchRunJob(jobId: CommonType.IdType, jobGroup: string) {
  return request<boolean>({
    url: '/monitor/job/run',
    method: 'put',
    data: { jobId, jobGroup },
  });
}
