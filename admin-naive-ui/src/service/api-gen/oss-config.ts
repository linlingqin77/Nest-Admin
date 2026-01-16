/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  ChangeOssConfigStatusRequestDto,
  CreateOssConfigRequestDto,
  OssConfigListResponseDto,
  OssConfigResponseDto,
  UpdateOssConfigRequestDto
} from './types';

/**
 * OSS配置管理-创建
 * @description 创建OSS配置
 */
export function fetchOssConfigCreate(data: CreateOssConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/resource/oss/config',
    data,
    operationId: 'OssConfigController_create_v1'
  });
}

/**
 * OSS配置管理-更新
 * @description 修改OSS配置
 */
export function fetchOssConfigUpdate(data: UpdateOssConfigRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/resource/oss/config',
    data,
    operationId: 'OssConfigController_update_v1'
  });
}

/**
 * OSS配置管理-列表
 * @description 分页查询OSS配置列表
 */
export function fetchOssConfigFindAll(params?: Record<string, unknown>) {
  return apiRequest<OssConfigListResponseDto>({
    method: 'GET',
    url: '/resource/oss/config/list',
    params,
    operationId: 'OssConfigController_findAll_v1'
  });
}

/**
 * OSS配置管理-详情
 * @description 根据ID获取OSS配置详情
 */
export function fetchOssConfigFindOne(id: string | number) {
  return apiRequest<OssConfigResponseDto>({
    method: 'GET',
    url: buildUrl('/resource/oss/config/{id}', { id }),
    operationId: 'OssConfigController_findOne_v1'
  });
}

/**
 * OSS配置管理-修改状态
 * @description 修改OSS配置状态
 */
export function fetchOssConfigChangeStatus(data: ChangeOssConfigStatusRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/resource/oss/config/changeStatus',
    data,
    operationId: 'OssConfigController_changeStatus_v1'
  });
}

/**
 * OSS配置管理-删除
 * @description 批量删除OSS配置，多个ID用逗号分隔
 */
export function fetchOssConfigRemove(ids: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/resource/oss/config/{ids}', { ids }),
    operationId: 'OssConfigController_remove_v1'
  });
}
