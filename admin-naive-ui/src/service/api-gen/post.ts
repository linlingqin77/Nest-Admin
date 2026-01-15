/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreatePostRequestDto, CreatePostResultResponseDto, UpdatePostRequestDto, UpdatePostResultResponseDto, PostListResponseDto, PostResponseDto, DeptTreeResponseDto, DeletePostResultResponseDto, ListPostRequestDto } from './types';

/**
 * 岗位管理-创建
 * @description 创建新岗位
 */
export function fetchPostCreate(data: CreatePostRequestDto) {
  return apiRequest<CreatePostResultResponseDto>({
    method: 'POST',
    url: '/system/post',
    data,
    operationId: 'PostController_create_v1',
  });
}

/**
 * 岗位管理-更新
 * @description 修改岗位信息
 */
export function fetchPostUpdate(data: UpdatePostRequestDto) {
  return apiRequest<UpdatePostResultResponseDto>({
    method: 'PUT',
    url: '/system/post',
    data,
    operationId: 'PostController_update_v1',
  });
}

/**
 * 岗位管理-列表
 * @description 分页查询岗位列表
 */
export function fetchPostFindAll(params?: Record<string, unknown>) {
  return apiRequest<PostListResponseDto>({
    method: 'GET',
    url: '/system/post/list',
    params,
    operationId: 'PostController_findAll_v1',
  });
}

/**
 * 岗位管理-选择框列表
 * @description 获取岗位选择框列表
 */
export function fetchPostOptionselect(params?: Record<string, unknown>) {
  return apiRequest<PostResponseDto[]>({
    method: 'GET',
    url: '/system/post/optionselect',
    params,
    operationId: 'PostController_optionselect_v1',
  });
}

/**
 * 岗位管理-部门树
 * @description 获取部门树形结构
 */
export function fetchPostDeptTree() {
  return apiRequest<DeptTreeResponseDto[]>({
    method: 'GET',
    url: '/system/post/deptTree',
    operationId: 'PostController_deptTree_v1',
  });
}

/**
 * 岗位管理-详情
 * @description 根据ID获取岗位详情
 */
export function fetchPostFindOne(id: string | number) {
  return apiRequest<PostResponseDto>({
    method: 'GET',
    url: buildUrl('/system/post/{id}', { id }),
    operationId: 'PostController_findOne_v1',
  });
}

/**
 * 岗位管理-删除
 * @description 批量删除岗位，多个ID用逗号分隔
 */
export function fetchPostRemove(ids: string | number) {
  return apiRequest<DeletePostResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/post/{ids}', { ids }),
    operationId: 'PostController_remove_v1',
  });
}

/**
 * 岗位管理-导出Excel
 * @description 导出岗位数据为xlsx文件
 */
export function fetchPostExport(data: ListPostRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/post/export',
    data,
    operationId: 'PostController_export_v1',
  });
}
