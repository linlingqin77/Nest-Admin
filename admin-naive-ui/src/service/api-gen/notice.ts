/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateNoticeRequestDto, CreateNoticeResultResponseDto, UpdateNoticeRequestDto, UpdateNoticeResultResponseDto, NoticeListResponseDto, NoticeResponseDto, DeleteNoticeResultResponseDto } from './types';

/**
 * 通知公告-创建
 * @description 发布新的通知公告
 */
export function fetchNoticeCreate(data: CreateNoticeRequestDto) {
  return apiRequest<CreateNoticeResultResponseDto>({
    method: 'POST',
    url: '/system/notice',
    data,
    operationId: 'NoticeController_create_v1',
  });
}

/**
 * 通知公告-更新
 * @description 修改通知公告内容
 */
export function fetchNoticeUpdate(data: UpdateNoticeRequestDto) {
  return apiRequest<UpdateNoticeResultResponseDto>({
    method: 'PUT',
    url: '/system/notice',
    data,
    operationId: 'NoticeController_update_v1',
  });
}

/**
 * 通知公告-列表
 * @description 分页查询通知公告列表
 */
export function fetchNoticeFindAll(params?: Record<string, unknown>) {
  return apiRequest<NoticeListResponseDto>({
    method: 'GET',
    url: '/system/notice/list',
    params,
    operationId: 'NoticeController_findAll_v1',
  });
}

/**
 * 通知公告-详情
 * @description 根据ID获取通知公告详情
 */
export function fetchNoticeFindOne(id: string | number) {
  return apiRequest<NoticeResponseDto>({
    method: 'GET',
    url: buildUrl('/system/notice/{id}', { id }),
    operationId: 'NoticeController_findOne_v1',
  });
}

/**
 * 通知公告-删除
 * @description 批量删除通知公告，多个ID用逗号分隔
 */
export function fetchNoticeRemove(id: string | number) {
  return apiRequest<DeleteNoticeResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/notice/{id}', { id }),
    operationId: 'NoticeController_remove_v1',
  });
}
