/**
 * 数据源管理 API
 * @description 提供数据源的 CRUD 操作、连接测试、元数据获取等 API
 * Requirements: 13.9
 */

import { apiRequest, buildUrl } from './request-adapter';

/**
 * 数据库类型枚举
 */
export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite';

/**
 * 数据源信息
 */
export interface DataSourceInfo {
  /** 数据源ID */
  id: number;
  /** 租户ID */
  tenantId: string;
  /** 数据源名称 */
  name: string;
  /** 数据库类型 */
  type: DatabaseType;
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  username: string;
  /** 状态（0正常 1停用） */
  status: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 创建数据源请求参数
 */
export interface CreateDataSourceDto {
  /** 数据源名称 */
  name: string;
  /** 数据库类型 */
  type: DatabaseType;
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 备注 */
  remark?: string;
}

/**
 * 更新数据源请求参数
 */
export interface UpdateDataSourceDto {
  /** 数据源名称 */
  name?: string;
  /** 数据库类型 */
  type?: DatabaseType;
  /** 主机地址 */
  host?: string;
  /** 端口号 */
  port?: number;
  /** 数据库名称 */
  database?: string;
  /** 用户名 */
  username?: string;
  /** 密码（留空则不更新） */
  password?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 查询数据源列表参数
 */
export interface QueryDataSourceDto {
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 数据源名称（模糊查询） */
  name?: string;
  /** 数据库类型 */
  type?: DatabaseType;
  /** 状态（0正常 1停用） */
  status?: string;
}

/**
 * 测试数据源连接参数
 */
export interface TestConnectionDto {
  /** 数据库类型 */
  type: DatabaseType;
  /** 主机地址 */
  host: string;
  /** 端口号 */
  port: number;
  /** 数据库名称 */
  database: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/**
 * 数据库表信息
 */
export interface DbTableInfo {
  /** 表名 */
  tableName: string;
  /** 表注释 */
  tableComment: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 数据库列信息
 */
export interface DbColumnInfo {
  /** 列名 */
  columnName: string;
  /** 列注释 */
  columnComment: string;
  /** 列类型 */
  columnType: string;
  /** 是否主键 */
  isPrimaryKey: boolean;
  /** 是否自增 */
  isAutoIncrement: boolean;
  /** 是否可空 */
  isNullable: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** 字符最大长度 */
  maxLength?: number;
}

/**
 * 数据源列表响应
 */
export interface DataSourceListResult {
  rows: DataSourceInfo[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 获取数据源列表
 * @description 分页查询数据源列表
 */
export function fetchDataSourceList(params?: QueryDataSourceDto) {
  return apiRequest<DataSourceListResult>({
    method: 'GET',
    url: '/tool/gen/datasource/list',
    params: params as unknown as Record<string, unknown>,
    operationId: 'DataSourceController_list_v1'
  });
}

/**
 * 获取数据源详情
 * @description 根据ID查询数据源详情
 */
export function fetchDataSourceById(id: number) {
  return apiRequest<DataSourceInfo>({
    method: 'GET',
    url: buildUrl('/tool/gen/datasource/{id}', { id }),
    operationId: 'DataSourceController_findOne_v1'
  });
}

/**
 * 创建数据源
 * @description 创建新的数据库连接配置
 */
export function fetchDataSourceCreate(data: CreateDataSourceDto) {
  return apiRequest<DataSourceInfo>({
    method: 'POST',
    url: '/tool/gen/datasource',
    data,
    operationId: 'DataSourceController_create_v1'
  });
}

/**
 * 更新数据源
 * @description 更新数据库连接配置
 */
export function fetchDataSourceUpdate(id: number, data: UpdateDataSourceDto) {
  return apiRequest<DataSourceInfo>({
    method: 'PUT',
    url: buildUrl('/tool/gen/datasource/{id}', { id }),
    data,
    operationId: 'DataSourceController_update_v1'
  });
}

/**
 * 删除数据源
 * @description 删除数据库连接配置（软删除）
 */
export function fetchDataSourceDelete(id: number) {
  return apiRequest<null>({
    method: 'DELETE',
    url: buildUrl('/tool/gen/datasource/{id}', { id }),
    operationId: 'DataSourceController_delete_v1'
  });
}

/**
 * 测试数据源连接
 * @description 测试数据库连接是否可用
 */
export function fetchDataSourceTestConnection(data: TestConnectionDto) {
  return apiRequest<boolean>({
    method: 'POST',
    url: '/tool/gen/datasource/test',
    data,
    operationId: 'DataSourceController_testConnection_v1'
  });
}

/**
 * 测试已保存的数据源连接
 * @description 测试已保存的数据库连接是否可用
 */
export function fetchDataSourceTestConnectionById(id: number) {
  return apiRequest<boolean>({
    method: 'GET',
    url: buildUrl('/tool/gen/datasource/{id}/test', { id }),
    operationId: 'DataSourceController_testConnectionById_v1'
  });
}

/**
 * 获取数据源的表列表
 * @description 获取指定数据源中的所有表
 */
export function fetchDataSourceTables(id: number) {
  return apiRequest<DbTableInfo[]>({
    method: 'GET',
    url: buildUrl('/tool/gen/datasource/{id}/tables', { id }),
    operationId: 'DataSourceController_getTables_v1'
  });
}

/**
 * 获取表的列信息
 * @description 获取指定表的所有列信息
 */
export function fetchDataSourceColumns(id: number, tableName: string) {
  return apiRequest<DbColumnInfo[]>({
    method: 'GET',
    url: buildUrl('/tool/gen/datasource/{id}/tables/{tableName}/columns', { id, tableName }),
    operationId: 'DataSourceController_getColumns_v1'
  });
}
