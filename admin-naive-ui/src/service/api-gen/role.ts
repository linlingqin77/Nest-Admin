/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  AllocatedUserListResponseDto,
  AuthUserCancelAllRequestDto,
  AuthUserCancelRequestDto,
  AuthUserResultResponseDto,
  AuthUserSelectAllRequestDto,
  ChangeRoleStatusRequestDto,
  ChangeRoleStatusResultResponseDto,
  CreateRoleRequestDto,
  CreateRoleResultResponseDto,
  DataScopeResultResponseDto,
  DeleteRoleResultResponseDto,
  ListRoleRequestDto,
  RoleDeptTreeResponseDto,
  RoleListResponseDto,
  RoleResponseDto,
  UpdateRoleRequestDto,
  UpdateRoleResultResponseDto
} from './types';

/**
 * 角色管理-创建
 * @description 创建新角色并分配权限
 */
export function fetchRoleCreate(data: CreateRoleRequestDto) {
  return apiRequest<CreateRoleResultResponseDto>({
    method: 'POST',
    url: '/system/role',
    data,
    operationId: 'RoleController_create_v1'
  });
}

/**
 * 角色管理-修改
 * @description 修改角色信息及权限
 */
export function fetchRoleUpdate(data: UpdateRoleRequestDto) {
  return apiRequest<UpdateRoleResultResponseDto>({
    method: 'PUT',
    url: '/system/role',
    data,
    operationId: 'RoleController_update_v1'
  });
}

/**
 * 角色管理-列表
 * @description 分页查询角色列表
 */
export function fetchRoleFindAll(params?: Record<string, unknown>) {
  return apiRequest<RoleListResponseDto>({
    method: 'GET',
    url: '/system/role/list',
    params,
    operationId: 'RoleController_findAll_v1'
  });
}

/**
 * 角色管理-选择框列表
 * @description 获取角色选择框列表
 */
export function fetchRoleOptionselect(params?: Record<string, unknown>) {
  return apiRequest<RoleResponseDto[]>({
    method: 'GET',
    url: '/system/role/optionselect',
    params,
    operationId: 'RoleController_optionselect_v1'
  });
}

/**
 * 角色管理-部门树
 * @description 获取角色数据权限的部门树
 */
export function fetchRoleDeptTree(id: string | number) {
  return apiRequest<RoleDeptTreeResponseDto>({
    method: 'GET',
    url: buildUrl('/system/role/deptTree/{id}', { id }),
    operationId: 'RoleController_deptTree_v1'
  });
}

/**
 * 角色管理-详情
 * @description 根据角色ID获取角色详情
 */
export function fetchRoleFindOne(id: string | number) {
  return apiRequest<RoleResponseDto>({
    method: 'GET',
    url: buildUrl('/system/role/{id}', { id }),
    operationId: 'RoleController_findOne_v1'
  });
}

/**
 * 角色管理-删除
 * @description 批量删除角色，多个ID用逗号分隔
 */
export function fetchRoleRemove(id: string | number) {
  return apiRequest<DeleteRoleResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/role/{id}', { id }),
    operationId: 'RoleController_remove_v1'
  });
}

/**
 * 角色管理-数据权限修改
 * @description 修改角色的数据权限范围
 */
export function fetchRoleDataScope(data: UpdateRoleRequestDto) {
  return apiRequest<DataScopeResultResponseDto>({
    method: 'PUT',
    url: '/system/role/dataScope',
    data,
    operationId: 'RoleController_dataScope_v1'
  });
}

/**
 * 角色管理-修改状态
 * @description 启用或停用角色
 */
export function fetchRoleChangeStatus(data: ChangeRoleStatusRequestDto) {
  return apiRequest<ChangeRoleStatusResultResponseDto>({
    method: 'PUT',
    url: '/system/role/changeStatus',
    data,
    operationId: 'RoleController_changeStatus_v1'
  });
}

/**
 * 角色管理-已分配用户列表
 * @description 获取角色已分配的用户列表
 */
export function fetchRoleAuthUserAllocatedList(params?: Record<string, unknown>) {
  return apiRequest<AllocatedUserListResponseDto>({
    method: 'GET',
    url: '/system/role/authUser/allocatedList',
    params,
    operationId: 'RoleController_authUserAllocatedList_v1'
  });
}

/**
 * 角色管理-未分配用户列表
 * @description 获取角色未分配的用户列表
 */
export function fetchRoleAuthUserUnAllocatedList(params?: Record<string, unknown>) {
  return apiRequest<AllocatedUserListResponseDto>({
    method: 'GET',
    url: '/system/role/authUser/unallocatedList',
    params,
    operationId: 'RoleController_authUserUnAllocatedList_v1'
  });
}

/**
 * 角色管理-解绑用户
 * @description 取消用户与角色的绑定关系
 */
export function fetchRoleAuthUserCancel(data: AuthUserCancelRequestDto) {
  return apiRequest<AuthUserResultResponseDto>({
    method: 'PUT',
    url: '/system/role/authUser/cancel',
    data,
    operationId: 'RoleController_authUserCancel_v1'
  });
}

/**
 * 角色管理-批量解绑用户
 * @description 批量取消用户与角色的绑定关系
 */
export function fetchRoleAuthUserCancelAll(data: AuthUserCancelAllRequestDto) {
  return apiRequest<AuthUserResultResponseDto>({
    method: 'PUT',
    url: '/system/role/authUser/cancelAll',
    data,
    operationId: 'RoleController_authUserCancelAll_v1'
  });
}

/**
 * 角色管理-批量绑定用户
 * @description 批量将用户绑定到角色
 */
export function fetchRoleAuthUserSelectAll(data: AuthUserSelectAllRequestDto) {
  return apiRequest<AuthUserResultResponseDto>({
    method: 'PUT',
    url: '/system/role/authUser/selectAll',
    data,
    operationId: 'RoleController_authUserSelectAll_v1'
  });
}

/**
 * 角色管理-导出Excel
 * @description 导出角色管理数据为xlsx文件
 */
export function fetchRoleExport(data: ListRoleRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/role/export',
    data,
    operationId: 'RoleController_export_v1'
  });
}
