/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { JobListResponseDto, JobResponseDto, CreateJobDto, CreateJobResultResponseDto, UpdateJobResultResponseDto, ChangeJobStatusResultResponseDto, DeleteJobResultResponseDto, RunJobResultResponseDto, ListJobDto } from './types';

/**
 * 获取定时任务列表
 * @description 分页查询定时任务列表
 */
export function fetchJobList(params?: Record<string, unknown>) {
  return apiRequest<JobListResponseDto>({
    method: 'GET',
    url: '/monitor/job/list',
    params,
    operationId: 'JobController_list_v1',
  });
}

/**
 * 获取定时任务详情
 * @description 根据任务ID获取定时任务详细信息
 */
export function fetchJobGetInfo(jobId: string | number) {
  return apiRequest<JobResponseDto>({
    method: 'GET',
    url: buildUrl('/monitor/job/{jobId}', { jobId }),
    operationId: 'JobController_getInfo_v1',
  });
}

/**
 * 创建定时任务
 * @description 新增定时任务
 */
export function fetchJobAdd(data: CreateJobDto) {
  return apiRequest<CreateJobResultResponseDto>({
    method: 'POST',
    url: '/monitor/job',
    data,
    operationId: 'JobController_add_v1',
  });
}

/**
 * 修改定时任务
 * @description 更新定时任务信息
 */
export function fetchJobUpdate() {
  return apiRequest<UpdateJobResultResponseDto>({
    method: 'PUT',
    url: '/monitor/job',
    operationId: 'JobController_update_v1',
  });
}

/**
 * 修改任务状态
 * @description 启用或停用定时任务
 */
export function fetchJobChangeStatus() {
  return apiRequest<ChangeJobStatusResultResponseDto>({
    method: 'PUT',
    url: '/monitor/job/changeStatus',
    operationId: 'JobController_changeStatus_v1',
  });
}

/**
 * 删除定时任务
 * @description 批量删除定时任务，多个ID用逗号分隔
 */
export function fetchJobRemove(jobIds: string | number) {
  return apiRequest<DeleteJobResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/job/{jobIds}', { jobIds }),
    operationId: 'JobController_remove_v1',
  });
}

/**
 * 立即执行一次
 * @description 手动触发定时任务执行
 */
export function fetchJobRun() {
  return apiRequest<RunJobResultResponseDto>({
    method: 'PUT',
    url: '/monitor/job/run',
    operationId: 'JobController_run_v1',
  });
}

/**
 * 导出定时任务Excel
 * @description 导出定时任务数据为xlsx文件
 */
export function fetchJobExport(data: ListJobDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/monitor/job/export',
    data,
    operationId: 'JobController_export_v1',
  });
}
