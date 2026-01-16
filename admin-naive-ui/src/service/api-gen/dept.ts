/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  CreateDeptRequestDto,
  CreateDeptResultResponseDto,
  DeleteDeptResultResponseDto,
  DeptResponseDto,
  UpdateDeptRequestDto,
  UpdateDeptResultResponseDto
} from './types';

/**
 * 部门管理-创建
 * @description 创建新部门，需要指定父部门ID
 */
export function fetchDeptCreate(data: CreateDeptRequestDto) {
  return apiRequest<CreateDeptResultResponseDto>({
    method: 'POST',
    url: '/system/dept',
    data,
    operationId: 'DeptController_create_v1'
  });
}

/**
 * 部门管理-更新
 * @description 更新部门信息
 */
export function fetchDeptUpdate(data: UpdateDeptRequestDto) {
  return apiRequest<UpdateDeptResultResponseDto>({
    method: 'PUT',
    url: '/system/dept',
    data,
    operationId: 'DeptController_update_v1'
  });
}

/**
 * 部门管理-列表
 * @description 获取部门列表，支持按名称和状态筛选
 */
export function fetchDeptFindAll(params?: Record<string, unknown>) {
  return apiRequest<DeptResponseDto[]>({
    method: 'GET',
    url: '/system/dept/list',
    params,
    operationId: 'DeptController_findAll_v1'
  });
}

/**
 * 部门管理-选择框列表
 * @description 获取部门选择框列表
 */
export function fetchDeptOptionselect() {
  return apiRequest<DeptResponseDto[]>({
    method: 'GET',
    url: '/system/dept/optionselect',
    operationId: 'DeptController_optionselect_v1'
  });
}

/**
 * 部门管理-详情
 * @description 根据部门ID获取部门详细信息
 */
export function fetchDeptFindOne(id: string | number) {
  return apiRequest<DeptResponseDto>({
    method: 'GET',
    url: buildUrl('/system/dept/{id}', { id }),
    operationId: 'DeptController_findOne_v1'
  });
}

/**
 * 部门管理-删除
 * @description 根据ID删除部门，如果存在子部门则无法删除
 */
export function fetchDeptRemove(id: string | number) {
  return apiRequest<DeleteDeptResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/dept/{id}', { id }),
    operationId: 'DeptController_remove_v1'
  });
}

/**
 * 部门管理-排除节点列表
 * @description 查询部门列表（排除指定节点及其子节点），用于编辑时选择父部门
 */
export function fetchDeptFindListExclude(id: string | number) {
  return apiRequest<DeptResponseDto[]>({
    method: 'GET',
    url: buildUrl('/system/dept/list/exclude/{id}', { id }),
    operationId: 'DeptController_findListExclude_v1'
  });
}
