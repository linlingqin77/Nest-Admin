/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */


import { apiRequest, buildUrl } from './request-adapter';
import type { CreateDictTypeRequestDto, CreateDictTypeResultResponseDto, UpdateDictTypeRequestDto, UpdateDictTypeResultResponseDto, RefreshCacheResultResponseDto, DeleteDictTypeResultResponseDto, DictTypeResponseDto, DictTypeListResponseDto, CreateDictDataRequestDto, CreateDictDataResultResponseDto, UpdateDictDataRequestDto, UpdateDictDataResultResponseDto, DeleteDictDataResultResponseDto, DictDataResponseDto, DictDataListResponseDto, ListDictTypeRequestDto } from './types';

/**
 * 字典类型-创建
 * @description 创建字典类型
 */
export function fetchDictCreateType(data: CreateDictTypeRequestDto) {
  return apiRequest<CreateDictTypeResultResponseDto>({
    method: 'POST',
    url: '/system/dict/type',
    data,
    operationId: 'DictController_createType_v1',
  });
}

/**
 * 字典类型-修改
 * @description 修改字典类型信息
 */
export function fetchDictUpdateType(data: UpdateDictTypeRequestDto) {
  return apiRequest<UpdateDictTypeResultResponseDto>({
    method: 'PUT',
    url: '/system/dict/type',
    data,
    operationId: 'DictController_updateType_v1',
  });
}

/**
 * 字典数据-刷新缓存
 * @description 清除并重新加载字典数据缓存
 */
export function fetchDictRefreshCache() {
  return apiRequest<RefreshCacheResultResponseDto>({
    method: 'DELETE',
    url: '/system/dict/type/refreshCache',
    operationId: 'DictController_refreshCache_v1',
  });
}

/**
 * 字典类型-删除
 * @description 批量删除字典类型，多个ID用逗号分隔
 */
export function fetchDictDeleteType(id: string | number) {
  return apiRequest<DeleteDictTypeResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/dict/type/{id}', { id }),
    operationId: 'DictController_deleteType_v1',
  });
}

/**
 * 字典类型-详情
 * @description 根据ID获取字典类型详情
 */
export function fetchDictFindOneType(id: string | number) {
  return apiRequest<DictTypeResponseDto>({
    method: 'GET',
    url: buildUrl('/system/dict/type/{id}', { id }),
    operationId: 'DictController_findOneType_v1',
  });
}

/**
 * 字典类型-列表
 * @description 分页查询字典类型列表
 */
export function fetchDictFindAllType(params?: Record<string, unknown>) {
  return apiRequest<DictTypeListResponseDto>({
    method: 'GET',
    url: '/system/dict/type/list',
    params,
    operationId: 'DictController_findAllType_v1',
  });
}

/**
 * 字典类型-下拉选项
 * @description 获取全部字典类型用于下拉选择
 */
export function fetchDictFindOptionselect() {
  return apiRequest<DictTypeResponseDto[]>({
    method: 'GET',
    url: '/system/dict/type/optionselect',
    operationId: 'DictController_findOptionselect_v1',
  });
}

/**
 * 字典数据-创建
 * @description 在指定字典类型下创建字典数据
 */
export function fetchDictCreateDictData(data: CreateDictDataRequestDto) {
  return apiRequest<CreateDictDataResultResponseDto>({
    method: 'POST',
    url: '/system/dict/data',
    data,
    operationId: 'DictController_createDictData_v1',
  });
}

/**
 * 字典数据-修改
 * @description 修改字典数据
 */
export function fetchDictUpdateDictData(data: UpdateDictDataRequestDto) {
  return apiRequest<UpdateDictDataResultResponseDto>({
    method: 'PUT',
    url: '/system/dict/data',
    data,
    operationId: 'DictController_updateDictData_v1',
  });
}

/**
 * 字典数据-删除
 * @description 批量删除字典数据，多个ID用逗号分隔
 */
export function fetchDictDeleteDictData(id: string | number) {
  return apiRequest<DeleteDictDataResultResponseDto>({
    method: 'DELETE',
    url: buildUrl('/system/dict/data/{id}', { id }),
    operationId: 'DictController_deleteDictData_v1',
  });
}

/**
 * 字典数据-详情
 * @description 根据字典编码获取字典数据详情
 */
export function fetchDictFindOneDictData(id: string | number) {
  return apiRequest<DictDataResponseDto>({
    method: 'GET',
    url: buildUrl('/system/dict/data/{id}', { id }),
    operationId: 'DictController_findOneDictData_v1',
  });
}

/**
 * 字典数据-列表
 * @description 查询指定字典类型下的数据列表
 */
export function fetchDictFindAllData(params?: Record<string, unknown>) {
  return apiRequest<DictDataListResponseDto>({
    method: 'GET',
    url: '/system/dict/data/list',
    params,
    operationId: 'DictController_findAllData_v1',
  });
}

/**
 * 字典数据-按类型查询（缓存）
 * @description 根据字典类型获取字典数据列表，优先使用缓存
 */
export function fetchDictFindOneDataType(id: string | number) {
  return apiRequest<DictDataResponseDto[]>({
    method: 'GET',
    url: buildUrl('/system/dict/data/type/{id}', { id }),
    operationId: 'DictController_findOneDataType_v1',
  });
}

/**
 * 字典类型-导出Excel
 * @description 导出字典类型为xlsx文件
 */
export function fetchDictExport(data: ListDictTypeRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/dict/type/export',
    data,
    operationId: 'DictController_export_v1',
  });
}

/**
 * 字典数据-导出Excel
 * @description 导出字典数据为xlsx文件
 */
export function fetchDictExportData(data: ListDictTypeRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/dict/data/export',
    data,
    operationId: 'DictController_exportData_v1',
  });
}
