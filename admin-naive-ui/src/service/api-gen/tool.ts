/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { GenTableUpdate, TableName } from './types';

/**
 * 数据表列表
 * @description 分页查询已导入的数据表列表
 */
export function fetchToolFindAll(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/tool/gen/list',
    params,
    operationId: 'ToolController_findAll_v1'
  });
}

/**
 * 查询数据库表列表
 * @description 查询数据库中未导入的表
 */
export function fetchToolGenDbList(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/tool/gen/db/list',
    params,
    operationId: 'ToolController_genDbList_v1'
  });
}

/**
 * 查询数据源名称列表
 * @description 获取可用的数据源名称
 */
export function fetchToolGetDataNames() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/tool/gen/getDataNames',
    operationId: 'ToolController_getDataNames_v1'
  });
}

/**
 * 导入表
 * @description 将数据库表导入到代码生成列表
 */
export function fetchToolGenImportTable(data: TableName) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/tool/gen/importTable',
    data,
    operationId: 'ToolController_genImportTable_v1'
  });
}

/**
 * 同步表结构
 * @description 从数据库同步表字段结构
 */
export function fetchToolSynchDb(tableName: string | number) {
  return apiRequest<unknown>({
    method: 'GET',
    url: buildUrl('/tool/gen/synchDb/{tableName}', { tableName }),
    operationId: 'ToolController_synchDb_v1'
  });
}

/**
 * 查询表详细信息
 * @description 获取代码生成表详情，包含字段信息
 */
export function fetchToolGen(id: string | number) {
  return apiRequest<unknown>({
    method: 'GET',
    url: buildUrl('/tool/gen/{id}', { id }),
    operationId: 'ToolController_gen_v1'
  });
}

/**
 * 删除表数据
 * @description 从代码生成列表中删除表
 */
export function fetchToolRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/tool/gen/{id}', { id }),
    operationId: 'ToolController_remove_v1'
  });
}

/**
 * 修改代码生成信息
 * @description 修改表的代码生成配置
 */
export function fetchToolGenUpdate(data: GenTableUpdate) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/tool/gen',
    data,
    operationId: 'ToolController_genUpdate_v1'
  });
}

/**
 * 批量生成代码
 * @description 生成代码并下载为zip压缩包
 */
export function fetchToolBatchGenCode(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/tool/gen/batchGenCode/zip',
    params,
    operationId: 'ToolController_batchGenCode_v1'
  });
}

/**
 * 预览生成代码
 * @description 在线预览生成的代码内容
 */
export function fetchToolPreview(id: string | number) {
  return apiRequest<unknown>({
    method: 'GET',
    url: buildUrl('/tool/gen/preview/{id}', { id }),
    operationId: 'ToolController_preview_v1'
  });
}
