/**
 * 模板管理 API
 * @description 提供模板组和模板的 CRUD 操作、模板验证、导入导出等 API
 * Requirements: 13.9
 */

import { apiRequest, buildUrl } from './request-adapter';

/**
 * 模板语言枚举
 */
export type TemplateLanguage = 'typescript' | 'vue' | 'sql';

/**
 * 模板信息
 */
export interface TemplateInfo {
  /** 模板ID */
  id: number;
  /** 模板组ID */
  groupId: number;
  /** 模板名称 */
  name: string;
  /** 输出文件名模板 */
  fileName: string;
  /** 输出路径模板 */
  filePath: string;
  /** 模板内容 */
  content: string;
  /** 模板语言 */
  language: TemplateLanguage;
  /** 排序号 */
  sort: number;
  /** 状态（0正常 1停用） */
  status: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 模板组信息
 */
export interface TemplateGroupInfo {
  /** 模板组ID */
  id: number;
  /** 租户ID（null表示系统级） */
  tenantId?: string | null;
  /** 模板组名称 */
  name: string;
  /** 模板组描述 */
  description?: string;
  /** 是否为默认模板组 */
  isDefault: boolean;
  /** 状态（0正常 1停用） */
  status: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime?: string;
  /** 模板列表 */
  templates?: TemplateInfo[];
}

/**
 * 创建模板组请求参数
 */
export interface CreateTemplateGroupDto {
  /** 模板组名称 */
  name: string;
  /** 模板组描述 */
  description?: string;
  /** 是否为默认模板组 */
  isDefault?: boolean;
}

/**
 * 更新模板组请求参数
 */
export interface UpdateTemplateGroupDto {
  /** 模板组名称 */
  name?: string;
  /** 模板组描述 */
  description?: string;
  /** 是否为默认模板组 */
  isDefault?: boolean;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 查询模板组列表参数
 */
export interface QueryTemplateGroupDto {
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 模板组名称（模糊查询） */
  name?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 是否只查询系统级模板 */
  systemOnly?: boolean;
}

/**
 * 创建模板请求参数
 */
export interface CreateTemplateDto {
  /** 模板组ID */
  groupId: number;
  /** 模板名称 */
  name: string;
  /** 输出文件名模板 */
  fileName: string;
  /** 输出路径模板 */
  filePath: string;
  /** 模板内容 */
  content: string;
  /** 模板语言 */
  language: TemplateLanguage;
  /** 排序号 */
  sort?: number;
}

/**
 * 更新模板请求参数
 */
export interface UpdateTemplateDto {
  /** 模板名称 */
  name?: string;
  /** 输出文件名模板 */
  fileName?: string;
  /** 输出路径模板 */
  filePath?: string;
  /** 模板内容 */
  content?: string;
  /** 模板语言 */
  language?: TemplateLanguage;
  /** 排序号 */
  sort?: number;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 查询模板列表参数
 */
export interface QueryTemplateDto {
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 模板组ID */
  groupId?: number;
  /** 模板名称（模糊查询） */
  name?: string;
  /** 模板语言 */
  language?: TemplateLanguage;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 验证模板语法请求参数
 */
export interface ValidateTemplateDto {
  /** 模板内容 */
  content: string;
}

/**
 * 模板验证结果
 */
export interface ValidateTemplateResult {
  /** 是否有效 */
  valid: boolean;
  /** 使用的变量列表 */
  variables: string[];
  /** 警告信息 */
  warnings: string[];
}

/**
 * 导入模板项
 */
export interface ImportTemplateItem {
  /** 模板名称 */
  name: string;
  /** 输出文件名模板 */
  fileName: string;
  /** 输出路径模板 */
  filePath: string;
  /** 模板内容 */
  content: string;
  /** 模板语言 */
  language: TemplateLanguage;
  /** 排序号 */
  sort?: number;
}

/**
 * 导入模板组请求参数
 */
export interface ImportTemplateGroupDto {
  /** 模板组名称 */
  name: string;
  /** 模板组描述 */
  description?: string;
  /** 模板列表 */
  templates: ImportTemplateItem[];
}

/**
 * 导出模板组数据
 */
export interface ExportTemplateGroupDto {
  /** 模板组名称 */
  name: string;
  /** 模板组描述 */
  description?: string;
  /** 导出时间 */
  exportTime: string;
  /** 版本号 */
  version: string;
  /** 模板列表 */
  templates: ImportTemplateItem[];
}

/**
 * 模板组列表响应
 */
export interface TemplateGroupListResult {
  rows: TemplateGroupInfo[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 模板列表响应
 */
export interface TemplateListResult {
  rows: TemplateInfo[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

// ==================== 模板组 API ====================

/**
 * 获取模板组列表
 * @description 分页查询模板组列表，包含当前租户和系统级模板组
 */
export function fetchTemplateGroupList(params?: QueryTemplateGroupDto) {
  return apiRequest<TemplateGroupListResult>({
    method: 'GET',
    url: '/tool/gen/template/group/list',
    params: params as unknown as Record<string, unknown>,
    operationId: 'TemplateController_listGroups_v1'
  });
}

/**
 * 获取模板组详情
 * @description 根据ID查询模板组详情，包含所有模板
 */
export function fetchTemplateGroupById(id: number) {
  return apiRequest<TemplateGroupInfo>({
    method: 'GET',
    url: buildUrl('/tool/gen/template/group/{id}', { id }),
    operationId: 'TemplateController_findOneGroup_v1'
  });
}

/**
 * 获取默认模板组
 * @description 获取当前租户或系统级的默认模板组
 */
export function fetchDefaultTemplateGroup() {
  return apiRequest<TemplateGroupInfo>({
    method: 'GET',
    url: '/tool/gen/template/group/default',
    operationId: 'TemplateController_getDefaultGroup_v1'
  });
}

/**
 * 创建模板组
 * @description 创建新的模板组
 */
export function fetchTemplateGroupCreate(data: CreateTemplateGroupDto) {
  return apiRequest<TemplateGroupInfo>({
    method: 'POST',
    url: '/tool/gen/template/group',
    data,
    operationId: 'TemplateController_createGroup_v1'
  });
}

/**
 * 更新模板组
 * @description 更新模板组信息
 */
export function fetchTemplateGroupUpdate(id: number, data: UpdateTemplateGroupDto) {
  return apiRequest<TemplateGroupInfo>({
    method: 'PUT',
    url: buildUrl('/tool/gen/template/group/{id}', { id }),
    data,
    operationId: 'TemplateController_updateGroup_v1'
  });
}

/**
 * 删除模板组
 * @description 删除模板组及其所有模板（软删除）
 */
export function fetchTemplateGroupDelete(id: number) {
  return apiRequest<null>({
    method: 'DELETE',
    url: buildUrl('/tool/gen/template/group/{id}', { id }),
    operationId: 'TemplateController_deleteGroup_v1'
  });
}

/**
 * 导出模板组
 * @description 将模板组导出为 JSON 数据
 */
export function fetchTemplateGroupExport(id: number) {
  return apiRequest<ExportTemplateGroupDto>({
    method: 'GET',
    url: buildUrl('/tool/gen/template/group/{id}/export', { id }),
    operationId: 'TemplateController_exportGroup_v1'
  });
}

/**
 * 导入模板组
 * @description 从 JSON 数据导入模板组
 */
export function fetchTemplateGroupImport(data: ImportTemplateGroupDto) {
  return apiRequest<TemplateGroupInfo>({
    method: 'POST',
    url: '/tool/gen/template/group/import',
    data,
    operationId: 'TemplateController_importGroup_v1'
  });
}

// ==================== 模板 API ====================

/**
 * 获取模板列表
 * @description 分页查询模板列表
 */
export function fetchTemplateList(params?: QueryTemplateDto) {
  return apiRequest<TemplateListResult>({
    method: 'GET',
    url: '/tool/gen/template/list',
    params: params as unknown as Record<string, unknown>,
    operationId: 'TemplateController_listTemplates_v1'
  });
}

/**
 * 获取模板详情
 * @description 根据ID查询模板详情
 */
export function fetchTemplateById(id: number) {
  return apiRequest<TemplateInfo>({
    method: 'GET',
    url: buildUrl('/tool/gen/template/{id}', { id }),
    operationId: 'TemplateController_findOneTemplate_v1'
  });
}

/**
 * 创建模板
 * @description 在指定模板组中创建新模板
 */
export function fetchTemplateCreate(data: CreateTemplateDto) {
  return apiRequest<TemplateInfo>({
    method: 'POST',
    url: '/tool/gen/template',
    data,
    operationId: 'TemplateController_createTemplate_v1'
  });
}

/**
 * 更新模板
 * @description 更新模板信息
 */
export function fetchTemplateUpdate(id: number, data: UpdateTemplateDto) {
  return apiRequest<TemplateInfo>({
    method: 'PUT',
    url: buildUrl('/tool/gen/template/{id}', { id }),
    data,
    operationId: 'TemplateController_updateTemplate_v1'
  });
}

/**
 * 删除模板
 * @description 删除模板（软删除）
 */
export function fetchTemplateDelete(id: number) {
  return apiRequest<null>({
    method: 'DELETE',
    url: buildUrl('/tool/gen/template/{id}', { id }),
    operationId: 'TemplateController_deleteTemplate_v1'
  });
}

/**
 * 验证模板语法
 * @description 验证模板内容的语法是否正确，并返回使用的变量列表
 */
export function fetchTemplateValidate(data: ValidateTemplateDto) {
  return apiRequest<ValidateTemplateResult>({
    method: 'POST',
    url: '/tool/gen/template/validate',
    data,
    operationId: 'TemplateController_validateTemplate_v1'
  });
}
