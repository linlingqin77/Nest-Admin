/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { OssListResponseDto, OssResponseDto } from './types';

/**
 * OSS文件管理-列表
 * @description 分页查询OSS文件列表
 */
export function fetchOssFindAll(params?: Record<string, unknown>) {
  return apiRequest<OssListResponseDto>({
    method: 'GET',
    url: '/resource/oss/list',
    params,
    operationId: 'OssController_findAll_v1',
  });
}

/**
 * OSS文件管理-根据ID列表查询
 * @description 根据ID列表获取OSS文件
 */
export function fetchOssFindByIds(ids: string | number) {
  return apiRequest<OssListResponseDto>({
    method: 'GET',
    url: buildUrl('/resource/oss/listByIds/{ids}', { ids }),
    operationId: 'OssController_findByIds_v1',
  });
}

/**
 * OSS文件管理-详情
 * @description 根据ID获取OSS文件详情
 */
export function fetchOssFindOne(id: string | number) {
  return apiRequest<OssResponseDto>({
    method: 'GET',
    url: buildUrl('/resource/oss/{id}', { id }),
    operationId: 'OssController_findOne_v1',
  });
}

/**
 * OSS文件管理-上传
 * @description 上传文件到OSS
 */
export function fetchOssUpload() {
  return apiRequest<OssResponseDto>({
    method: 'POST',
    url: '/resource/oss/upload',
    operationId: 'OssController_upload_v1',
  });
}

/**
 * OSS文件管理-删除
 * @description 批量删除OSS文件，多个ID用逗号分隔
 */
export function fetchOssRemove(ids: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/resource/oss/{ids}', { ids }),
    operationId: 'OssController_remove_v1',
  });
}
