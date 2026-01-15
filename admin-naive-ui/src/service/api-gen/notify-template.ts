/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateNotifyTemplateDto, UpdateNotifyTemplateDto, NotifyTemplateListVo, NotifyTemplateSelectVo, NotifyTemplateDetailVo } from './types';

/**
 * 站内信模板-创建
 * @description 创建新的站内信模板
 */
export function fetchNotifyTemplateCreate(data: CreateNotifyTemplateDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/notify/template',
    data,
    operationId: 'NotifyTemplateController_create_v1',
  });
}

/**
 * 站内信模板-更新
 * @description 修改站内信模板信息
 */
export function fetchNotifyTemplateUpdate(data: UpdateNotifyTemplateDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/notify/template',
    data,
    operationId: 'NotifyTemplateController_update_v1',
  });
}

/**
 * 站内信模板-列表
 * @description 分页查询站内信模板列表
 */
export function fetchNotifyTemplateFindAll(params?: Record<string, unknown>) {
  return apiRequest<NotifyTemplateListVo>({
    method: 'GET',
    url: '/system/notify/template/list',
    params,
    operationId: 'NotifyTemplateController_findAll_v1',
  });
}

/**
 * 站内信模板-下拉选择
 * @description 获取所有启用的站内信模板（用于下拉选择）
 */
export function fetchNotifyTemplateGetSelectList() {
  return apiRequest<NotifyTemplateSelectVo>({
    method: 'GET',
    url: '/system/notify/template/select',
    operationId: 'NotifyTemplateController_getSelectList_v1',
  });
}

/**
 * 站内信模板-详情
 * @description 根据ID获取站内信模板详情
 */
export function fetchNotifyTemplateFindOne(id: string | number) {
  return apiRequest<NotifyTemplateDetailVo>({
    method: 'GET',
    url: buildUrl('/system/notify/template/{id}', { id }),
    operationId: 'NotifyTemplateController_findOne_v1',
  });
}

/**
 * 站内信模板-删除
 * @description 批量删除站内信模板，多个ID用逗号分隔
 */
export function fetchNotifyTemplateRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/notify/template/{id}', { id }),
    operationId: 'NotifyTemplateController_remove_v1',
  });
}
