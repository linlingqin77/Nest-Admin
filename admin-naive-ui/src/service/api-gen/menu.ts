/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  CreateMenuRequestDto,
  CreateMenuResultResponseDto,
  DeleteMenuResultResponseDto,
  MenuResponseDto,
  MenuTreeResponseDto,
  RoleMenuTreeSelectResponseDto,
  UpdateMenuRequestDto,
  UpdateMenuResultResponseDto
} from './types';

/**
 * 菜单管理-获取路由
 * @description 获取当前用户的路由菜单
 */
export function fetchMenuGetRouters() {
  return apiRequest<MenuResponseDto[]>({
    method: 'GET',
    url: '/system/menu/getRouters',
    operationId: 'MenuController_getRouters_v1'
  });
}

/**
 * 菜单管理-创建
 * @description 创建新菜单，支持目录、菜单、按钮三种类型
 */
export function fetchMenuCreate(data: CreateMenuRequestDto) {
  return apiRequest<CreateMenuResultResponseDto>({
    method: 'POST',
    url: '/system/menu',
    data,
    operationId: 'MenuController_create_v1'
  });
}

/**
 * 菜单管理-修改
 * @description 修改菜单信息
 */
export function fetchMenuUpdate(data: UpdateMenuRequestDto) {
  return apiRequest<UpdateMenuResultResponseDto>({
    method: 'PUT',
    url: '/system/menu',
    data,
    operationId: 'MenuController_update_v1'
  });
}

/**
 * 菜单管理-列表
 * @description 获取菜单列表，支持按名称和状态筛选
 */
export function fetchMenuFindAll(params?: Record<string, unknown>) {
  return apiRequest<MenuResponseDto[]>({
    method: 'GET',
    url: '/system/menu/list',
    params,
    operationId: 'MenuController_findAll_v1'
  });
}

/**
 * 菜单管理-树形选择
 * @description 获取菜单树形结构，用于下拉选择
 */
export function fetchMenuTreeSelect() {
  return apiRequest<MenuTreeResponseDto[]>({
    method: 'GET',
    url: '/system/menu/treeselect',
    operationId: 'MenuController_treeSelect_v1'
  });
}

/**
 * 菜单管理-角色菜单树
 * @description 获取角色已分配的菜单树结构
 */
export function fetchMenuRoleMenuTreeselect(roleId: string | number) {
  return apiRequest<RoleMenuTreeSelectResponseDto>({
    method: 'GET',
    url: buildUrl('/system/menu/roleMenuTreeselect/{roleId}', { roleId }),
    operationId: 'MenuController_roleMenuTreeselect_v1'
  });
}

/**
 * 菜单管理-租户套餐菜单树
 * @description 获取租户套餐已分配的菜单树结构
 */
export function fetchMenuTenantPackageMenuTreeselect(packageId: string | number) {
  return apiRequest<RoleMenuTreeSelectResponseDto>({
    method: 'GET',
    url: buildUrl('/system/menu/tenantPackageMenuTreeselect/{packageId}', { packageId }),
    operationId: 'MenuController_tenantPackageMenuTreeselect_v1'
  });
}

/**
 * 菜单管理-详情
 * @description 根据菜单ID获取菜单详细信息
 */
export function fetchMenuFindOne(menuId: string | number) {
  return apiRequest<MenuResponseDto>({
    method: 'GET',
    url: buildUrl('/system/menu/{menuId}', { menuId }),
    operationId: 'MenuController_findOne_v1'
  });
}

/**
 * 菜单管理-删除
 * @description 删除菜单，会同时删除子菜单
 */
export function fetchMenuRemove(menuId: string | number) {
  return apiRequest<DeleteMenuResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/menu/{menuId}', { menuId }),
    operationId: 'MenuController_remove_v1'
  });
}

/**
 * 菜单管理-级联删除
 * @description 级联删除菜单，多个ID用逗号分隔
 */
export function fetchMenuCascadeRemove(menuIds: string | number) {
  return apiRequest<DeleteMenuResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/menu/cascade/{menuIds}', { menuIds }),
    operationId: 'MenuController_cascadeRemove_v1'
  });
}
