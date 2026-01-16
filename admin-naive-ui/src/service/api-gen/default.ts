/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:05:55.236Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  ChangeClientStatusRequestDto,
  ClientListResponseDto,
  ClientResponseDto,
  CreateClientRequestDto,
  UpdateClientRequestDto
} from './types';

/**
 * 客户端管理-创建
 * @description 创建客户端
 */
export function fetchClientCreate(data: CreateClientRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/client',
    data,
    operationId: 'ClientController_create_v1'
  });
}

/**
 * 客户端管理-更新
 * @description 修改客户端
 */
export function fetchClientUpdate(data: UpdateClientRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/client',
    data,
    operationId: 'ClientController_update_v1'
  });
}

/**
 * 客户端管理-列表
 * @description 分页查询客户端列表
 */
export function fetchClientFindAll(params?: Record<string, unknown>) {
  return apiRequest<ClientListResponseDto>({
    method: 'GET',
    url: '/system/client/list',
    params,
    operationId: 'ClientController_findAll_v1'
  });
}

/**
 * 客户端管理-详情
 * @description 根据ID获取客户端详情
 */
export function fetchClientFindOne(id: string | number) {
  return apiRequest<ClientResponseDto>({
    method: 'GET',
    url: buildUrl('/system/client/{id}', { id }),
    operationId: 'ClientController_findOne_v1'
  });
}

/**
 * 客户端管理-修改状态
 * @description 修改客户端状态
 */
export function fetchClientChangeStatus(data: ChangeClientStatusRequestDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/client/changeStatus',
    data,
    operationId: 'ClientController_changeStatus_v1'
  });
}

/**
 * 客户端管理-删除
 * @description 批量删除客户端，多个ID用逗号分隔
 */
export function fetchClientRemove(ids: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/client/{ids}', { ids }),
    operationId: 'ClientController_remove_v1'
  });
}
