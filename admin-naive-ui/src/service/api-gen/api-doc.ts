/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';

/**
 * 获取所有错误码
 * @description 返回系统中所有的错误码及其含义，按错误码排序
 */
export function fetchDocsGetErrorCodes() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/docs/error-codes',
    operationId: 'DocsController_getErrorCodes_v1',
  });
}

/**
 * 按分类获取错误码
 * @description 返回按分类组织的错误码列表
 */
export function fetchDocsGetErrorCodesByCategory() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/docs/error-codes/by-category',
    operationId: 'DocsController_getErrorCodesByCategory_v1',
  });
}

/**
 * 获取 Markdown 格式错误码文档
 * @description 返回 Markdown 格式的完整错误码文档，可用于生成文档
 */
export function fetchDocsGetErrorCodesMarkdown() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/docs/error-codes/markdown',
    operationId: 'DocsController_getErrorCodesMarkdown_v1',
  });
}

/**
 * 获取 JSON 格式错误码文档
 * @description 返回 JSON 格式的完整错误码文档，包含分类和详细说明
 */
export function fetchDocsGetErrorCodesJson() {
  return apiRequest<unknown>({
    method: 'GET',
    url: '/system/docs/error-codes/json',
    operationId: 'DocsController_getErrorCodesJson_v1',
  });
}
