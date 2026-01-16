/**
 * 生成历史管理 API
 * @description 提供代码生成历史的查询、下载、删除等 API
 * Requirements: 13.9
 */

import { apiRequest, buildUrl } from './request-adapter';

/**
 * 生成历史信息
 */
export interface GenHistoryInfo {
  /** 历史记录ID */
  id: number;
  /** 租户ID */
  tenantId: string;
  /** 表ID */
  tableId: number;
  /** 表名 */
  tableName: string;
  /** 模板组ID */
  templateGroupId: number;
  /** 生成人 */
  generatedBy: string;
  /** 生成时间 */
  generatedAt: string;
  /** 关联的表信息 */
  table?: {
    tableName: string;
    tableComment: string;
    className: string;
  };
  /** 关联的模板组信息 */
  templateGroup?: {
    name: string;
  };
}

/**
 * 历史记录详情（包含快照数据）
 */
export interface GenHistoryDetail extends GenHistoryInfo {
  /** 快照数据 */
  snapshotData: {
    files: PreviewFile[];
  };
}

/**
 * 预览文件信息
 */
export interface PreviewFile {
  /** 文件名 */
  name: string;
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
  /** 文件语言 */
  language: string;
  /** 文件大小（字节） */
  size: number;
  /** 行数 */
  lineCount: number;
}

/**
 * 查询历史记录列表参数
 */
export interface QueryHistoryDto {
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 表ID */
  tableId?: number;
  /** 表名（模糊查询） */
  tableName?: string;
}

/**
 * 历史记录列表响应
 */
export interface HistoryListResult {
  rows: GenHistoryInfo[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 获取历史记录列表
 * @description 分页查询代码生成历史记录列表
 */
export function fetchHistoryList(params?: QueryHistoryDto) {
  return apiRequest<HistoryListResult>({
    method: 'GET',
    url: '/tool/gen/history/list',
    params: params as unknown as Record<string, unknown>,
    operationId: 'HistoryController_list_v1'
  });
}

/**
 * 获取历史记录详情
 * @description 根据ID查询历史记录详情，包含生成的代码快照
 */
export function fetchHistoryById(id: number) {
  return apiRequest<GenHistoryDetail>({
    method: 'GET',
    url: buildUrl('/tool/gen/history/{id}', { id }),
    operationId: 'HistoryController_findOne_v1'
  });
}

/**
 * 下载历史版本代码
 * @description 下载指定历史版本的生成代码（ZIP格式）
 * @returns 返回下载URL
 */
export function getHistoryDownloadUrl(id: number): string {
  return `/tool/gen/history/${id}/download`;
}

/**
 * 删除历史记录
 * @description 删除指定的历史记录
 */
export function fetchHistoryDelete(id: number) {
  return apiRequest<null>({
    method: 'DELETE',
    url: buildUrl('/tool/gen/history/{id}', { id }),
    operationId: 'HistoryController_delete_v1'
  });
}

/**
 * 批量删除历史记录
 * @description 批量删除多条历史记录
 */
export function fetchHistoryBatchDelete(historyIds: number[]) {
  return apiRequest<number>({
    method: 'DELETE',
    url: '/tool/gen/history/batch',
    data: { historyIds },
    operationId: 'HistoryController_batchDelete_v1'
  });
}

/**
 * 清理过期历史记录
 * @description 清理指定天数之前的历史记录（默认30天）
 */
export function fetchHistoryCleanup(days?: number) {
  return apiRequest<number>({
    method: 'POST',
    url: '/tool/gen/history/cleanup',
    params: days ? { days } : undefined,
    operationId: 'HistoryController_cleanup_v1'
  });
}
