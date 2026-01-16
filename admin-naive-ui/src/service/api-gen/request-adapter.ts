/**
 * @generated - 此文件为 API 生成基础设施，请勿删除
 * 请求适配器：将生成的 API 请求配置转换为项目 request 格式
 */

import type { AxiosResponse } from 'axios';
import { request } from '../request';
import { apiCustomConfigs } from './api-config';

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** HTTP 方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求 URL */
  url: string;
  /** 请求体数据 */
  data?: unknown;
  /** 查询参数 */
  params?: Record<string, unknown>;
  /** 自定义请求头 */
  headers?: Record<string, unknown>;
  /** 操作 ID，用于匹配自定义配置 */
  operationId?: string;
}

/**
 * 获取自定义请求头配置
 * @param operationId 操作 ID
 * @returns 自定义请求头
 */
function getCustomHeaders(operationId?: string): Record<string, string | boolean> {
  if (!operationId) return {};

  const config = apiCustomConfigs[operationId];
  if (!config) return {};

  const headers: Record<string, string | boolean> = {};

  if (config.isEncrypt !== undefined) {
    headers.isEncrypt = config.isEncrypt ? 'true' : 'false';
  }

  if (config.repeatSubmit !== undefined) {
    headers.repeatSubmit = config.repeatSubmit;
  }

  if (config.isToken !== undefined) {
    headers.isToken = config.isToken;
  }

  return headers;
}

/**
 * FlatResponseData 兼容类型
 */
export type FlatResponseData<T> = {
  data: T;
  error: null;
  response: AxiosResponse;
};

/**
 * API 请求适配器
 * 将生成的请求配置转换为项目 request 格式
 *
 * @param config 请求配置
 * @returns Promise<FlatResponseData<T>> 响应数据
 */
export async function apiRequest<T>(config: RequestConfig): Promise<FlatResponseData<T>> {
  const { method, url, data, params, headers, operationId } = config;

  // 合并自定义配置
  const customHeaders = getCustomHeaders(operationId);
  const mergedHeaders = { ...customHeaders, ...headers } as Record<string, string | boolean>;

  const result = await request<T>({
    method: method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch',
    url,
    data,
    params,
    headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : undefined
  });

  return result as FlatResponseData<T>;
}

/**
 * 构建带路径参数的 URL
 * @param template URL 模板，如 '/users/{userId}'
 * @param params 路径参数对象
 * @returns 替换后的 URL
 */
export function buildUrl(template: string, params: Record<string, string | number>): string {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, String(value));
  }
  return url;
}
