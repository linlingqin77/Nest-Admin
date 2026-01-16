/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  CacheInfoResponseDto,
  CacheKeyResponseDto,
  CacheKeysResponseDto,
  CacheNamesResponseDto,
  ClearCacheResultResponseDto
} from './types';

/**
 * 缓存监控信息
 * @description 获取Redis缓存监控信息
 */
export function fetchCacheGetInfo() {
  return apiRequest<CacheInfoResponseDto>({
    method: 'GET',
    url: '/monitor/cache',
    operationId: 'CacheController_getInfo_v1'
  });
}

/**
 * 缓存名称列表
 * @description 获取所有缓存分类名称
 */
export function fetchCacheGetNames() {
  return apiRequest<CacheNamesResponseDto>({
    method: 'GET',
    url: '/monitor/cache/getNames',
    operationId: 'CacheController_getNames_v1'
  });
}

/**
 * 缓存键名列表
 * @description 根据缓存名称获取所有键名
 */
export function fetchCacheGetKeys(id: string | number) {
  return apiRequest<CacheKeysResponseDto>({
    method: 'GET',
    url: buildUrl('/monitor/cache/getKeys/{id}', { id }),
    operationId: 'CacheController_getKeys_v1'
  });
}

/**
 * 缓存内容
 * @description 获取指定缓存的内容
 */
export function fetchCacheGetValue(cacheName: string | number, cacheKey: string | number) {
  return apiRequest<CacheKeyResponseDto>({
    method: 'GET',
    url: buildUrl('/monitor/cache/getValue/{cacheName}/{cacheKey}', { cacheName, cacheKey }),
    operationId: 'CacheController_getValue_v1'
  });
}

/**
 * 清理缓存名称
 * @description 清除指定分类下的所有缓存
 */
export function fetchCacheClearCacheName(cacheName: string | number) {
  return apiRequest<ClearCacheResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/cache/clearCacheName/{cacheName}', { cacheName }),
    operationId: 'CacheController_clearCacheName_v1'
  });
}

/**
 * 清理缓存键名
 * @description 清除指定的缓存键
 */
export function fetchCacheClearCacheKey(cacheKey: string | number) {
  return apiRequest<ClearCacheResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/monitor/cache/clearCacheKey/{cacheKey}', { cacheKey }),
    operationId: 'CacheController_clearCacheKey_v1'
  });
}

/**
 * 清理全部缓存
 * @description 清除所有缓存数据
 */
export function fetchCacheClearCacheAll() {
  return apiRequest<ClearCacheResultResponseDto>({
    method: 'DELETE',
    url: '/monitor/cache/clearCacheAll',
    operationId: 'CacheController_clearCacheAll_v1'
  });
}
