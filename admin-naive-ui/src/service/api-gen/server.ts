/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { ServerInfoResponseDto } from './types';

/**
 * 服务器信息
 * @description 获取服务器CPU、内存、系统等监控信息
 */
export function fetchServerGetInfo() {
  return apiRequest<ServerInfoResponseDto>({
    method: 'GET',
    url: '/monitor/server',
    operationId: 'ServerController_getInfo_v1',
  });
}
