/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateMailTemplateDto, UpdateMailTemplateDto, MailTemplateListVo, MailTemplateDetailVo } from './types';

/**
 * 邮件模板-创建
 * @description 创建新的邮件模板
 */
export function fetchMailTemplateCreate(data: CreateMailTemplateDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/mail/template',
    data,
    operationId: 'MailTemplateController_create_v1',
  });
}

/**
 * 邮件模板-更新
 * @description 修改邮件模板信息
 */
export function fetchMailTemplateUpdate(data: UpdateMailTemplateDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/mail/template',
    data,
    operationId: 'MailTemplateController_update_v1',
  });
}

/**
 * 邮件模板-列表
 * @description 分页查询邮件模板列表
 */
export function fetchMailTemplateFindAll(params?: Record<string, unknown>) {
  return apiRequest<MailTemplateListVo>({
    method: 'GET',
    url: '/system/mail/template/list',
    params,
    operationId: 'MailTemplateController_findAll_v1',
  });
}

/**
 * 邮件模板-详情
 * @description 根据ID获取邮件模板详情
 */
export function fetchMailTemplateFindOne(id: string | number) {
  return apiRequest<MailTemplateDetailVo>({
    method: 'GET',
    url: buildUrl('/system/mail/template/{id}', { id }),
    operationId: 'MailTemplateController_findOne_v1',
  });
}

/**
 * 邮件模板-删除
 * @description 批量删除邮件模板，多个ID用逗号分隔
 */
export function fetchMailTemplateRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/mail/template/{id}', { id }),
    operationId: 'MailTemplateController_remove_v1',
  });
}
