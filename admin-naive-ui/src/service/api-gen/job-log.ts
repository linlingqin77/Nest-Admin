/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { JobLogListResponseDto, ClearLogResultResponseDto, ListJobLogDto } from './types';

/**
 * 获取定时任务日志列表
 * @description 分页查询定时任务执行日志
 */
export function fetchJobLogList(params?: Record<string, unknown>) {
  return apiRequest<JobLogListResponseDto>({
    method: 'GET',
    url: '/monitor/jobLog/list',
    params,
    operationId: 'JobLogController_list_v1',
  });
}

/**
 * 清空定时任务日志
 * @description 清除所有定时任务执行日志
 */
export function fetchJobLogClean() {
  return apiRequest<ClearLogResultResponseDto>({
    method: 'DELETE',
    url: '/monitor/jobLog/clean',
    operationId: 'JobLogController_clean_v1',
  });
}

/**
 * 导出调度日志Excel
 * @description 导出定时任务执行日志为xlsx文件
 */
export function fetchJobLogExport(data: ListJobLogDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/monitor/jobLog/export',
    data,
    operationId: 'JobLogController_export_v1',
  });
}
