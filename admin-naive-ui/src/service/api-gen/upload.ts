/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type { ChunkMergeFileDto } from './types';

/**
 * 文件上传
 * @description 上传单个文件
 */
export function fetchUploadSingleFileUpload() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/common/upload',
    operationId: 'UploadController_singleFileUpload_v1'
  });
}

/**
 * 获取切片上传任务Id
 * @description 初始化切片上传，获取任务ID
 */
export function fetchUploadGetChunkUploadId() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/common/upload/chunk/uploadId',
    operationId: 'UploadController_getChunkUploadId_v1'
  });
}

/**
 * 文件分片上传
 * @description 上传文件分片
 */
export function fetchUploadChunkFileUpload() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/common/upload/chunk',
    operationId: 'UploadController_chunkFileUpload_v1'
  });
}

/**
 * 文件分片合并
 * @description 合并所有分片为完整文件
 */
export function fetchUploadChunkMergeFile(data: ChunkMergeFileDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/common/upload/chunk/merge',
    data,
    operationId: 'UploadController_chunkMergeFile_v1'
  });
}

/**
 * 获取切片上传任务结果
 * @description 查询切片上传任务的状态
 */
export function fetchUploadGetChunkUploadResult(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/common/upload/chunk/result',
    params,
    operationId: 'UploadController_getChunkUploadResult_v1'
  });
}

/**
 * 获取cos授权
 * @description 获取腾讯云COS上传临时授权密钥
 */
export function fetchUploadGetAuthorization(params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/common/upload/cos/authorization',
    params,
    operationId: 'UploadController_getAuthorization_v1'
  });
}
