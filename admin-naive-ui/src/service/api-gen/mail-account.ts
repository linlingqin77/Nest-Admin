/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateMailAccountDto, UpdateMailAccountDto, MailAccountListVo, MailAccountDetailVo } from './types';

/**
 * 邮箱账号-创建
 * @description 创建新的邮箱账号
 */
export function fetchMailAccountCreate(data: CreateMailAccountDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/mail/account',
    data,
    operationId: 'MailAccountController_create_v1',
  });
}

/**
 * 邮箱账号-更新
 * @description 修改邮箱账号信息
 */
export function fetchMailAccountUpdate(data: UpdateMailAccountDto) {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/mail/account',
    data,
    operationId: 'MailAccountController_update_v1',
  });
}

/**
 * 邮箱账号-列表
 * @description 分页查询邮箱账号列表
 */
export function fetchMailAccountFindAll(params?: Record<string, unknown>) {
  return apiRequest<MailAccountListVo>({
    method: 'GET',
    url: '/system/mail/account/list',
    params,
    operationId: 'MailAccountController_findAll_v1',
  });
}

/**
 * 邮箱账号-启用列表
 * @description 获取所有启用的邮箱账号（用于下拉选择）
 */
export function fetchMailAccountGetEnabledAccounts() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/mail/account/enabled',
    operationId: 'MailAccountController_getEnabledAccounts_v1',
  });
}

/**
 * 邮箱账号-详情
 * @description 根据ID获取邮箱账号详情
 */
export function fetchMailAccountFindOne(id: string | number) {
  return apiRequest<MailAccountDetailVo>({
    method: 'GET',
    url: buildUrl('/system/mail/account/{id}', { id }),
    operationId: 'MailAccountController_findOne_v1',
  });
}

/**
 * 邮箱账号-删除
 * @description 批量删除邮箱账号，多个ID用逗号分隔
 */
export function fetchMailAccountRemove(id: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/mail/account/{id}', { id }),
    operationId: 'MailAccountController_remove_v1',
  });
}
