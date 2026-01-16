/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  ClearLogResultResponseDto,
  DeleteLogResultResponseDto,
  OperLogListResponseDto,
  OperLogResponseDto,
  QueryOperLogDto
} from './types';

/**
 * 操作日志-清除全部日志
 * @description 清空所有操作日志记录
 */
export function fetchOperlogRemoveAll() {
  return apiRequest<ClearLogResultResponseDto>({
    method: 'DELETE',
    url: '/monitor/operlog/clean',
    operationId: 'OperlogController_removeAll_v1'
  });
}

/**
 * 操作日志-列表
 * @description 分页查询操作日志列表
 */
export function fetchOperlogFindAll(params?: Record<string, unknown>) {
  return apiRequest<OperLogListResponseDto>({
    method: 'GET',
    url: '/monitor/operlog/list',
    params,
    operationId: 'OperlogController_findAll_v1'
  });
}

/**
 * 操作日志-详情
 * @description 根据日志ID获取操作日志详情
 */
export function fetchOperlogFindOne(operId: string | number) {
  return apiRequest<OperLogResponseDto>({
    method: 'GET',
    url: buildUrl('/monitor/operlog/{operId}', { operId }),
    operationId: 'OperlogController_findOne_v1'
  });
}

/**
 * 操作日志-删除
 * @description 删除指定操作日志记录
 */
export function fetchOperlogRemove(operId: string | number) {
  return apiRequest<DeleteLogResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/operlog/{operId}', { operId }),
    operationId: 'OperlogController_remove_v1'
  });
}

/**
 * 操作日志-导出Excel
 * @description 导出操作日志数据为xlsx文件
 */
export function fetchOperlogExportData(data: QueryOperLogDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/monitor/operlog/export',
    data,
    operationId: 'OperlogController_exportData_v1'
  });
}
