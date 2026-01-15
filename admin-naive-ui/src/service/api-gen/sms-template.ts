/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateSmsTemplateDto, UpdateSmsTemplateDto, SmsTemplateListVo, SmsTemplateDetailVo } from './types';

/**
 * 短信模板-创建
 * @description 创建新的短信模板
 */
export function fetchSmsTemplateCreate(data: CreateSmsTemplateDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/sms/template',
    data,
    operationId: 'SmsTemplateController_create_v1',
  });
}

/**
 * 短信模板-更新
 * @description 修改短信模板信息
 */
export function fetchSmsTemplateUpdate(data: UpdateSmsTemplateDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/sms/template',
    data,
    operationId: 'SmsTemplateController_update_v1',
  });
}

/**
 * 短信模板-列表
 * @description 分页查询短信模板列表
 */
export function fetchSmsTemplateFindAll(params?: Record<string, unknown>) {
  return apiRequest<SmsTemplateListVo>({
    method: 'GET',
    url: '/system/sms/template/list',
    params,
    operationId: 'SmsTemplateController_findAll_v1',
  });
}

/**
 * 短信模板-详情
 * @description 根据ID获取短信模板详情
 */
export function fetchSmsTemplateFindOne(id: string | number) {
  return apiRequest<SmsTemplateDetailVo>({
    method: 'GET',
    url: buildUrl('/system/sms/template/{id}', { id }),
    operationId: 'SmsTemplateController_findOne_v1',
  });
}

/**
 * 短信模板-删除
 * @description 批量删除短信模板，多个ID用逗号分隔
 */
export function fetchSmsTemplateRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/sms/template/{id}', { id }),
    operationId: 'SmsTemplateController_remove_v1',
  });
}
