/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: 2026-01-13T04:08:14.931Z
 * 如需修改 API 配置，请编辑 api-config.ts
 */

import { apiRequest, buildUrl } from './request-adapter';
import type {
  AccessTokenResponseDto,
  CreateFolderRequestDto,
  CreateShareRequestDto,
  CreateShareResultResponseDto,
  FileListResponseDto,
  FileResponseDto,
  FileVersionListResponseDto,
  FolderResponseDto,
  FolderTreeNodeResponseDto,
  MoveFileRequestDto,
  RenameFileRequestDto,
  RestoreVersionResultResponseDto,
  ShareInfoResponseDto,
  ShareListResponseDto,
  StorageStatsResponseDto,
  UpdateFolderRequestDto
} from './types';

/**
 * 创建文件夹
 */
export function fetchFileManagerCreateFolder(data: CreateFolderRequestDto) {
  return apiRequest<FolderResponseDto>({
    method: 'POST',
    url: '/system/file-manager/folder',
    data,
    operationId: 'FileManagerController_createFolder_v1'
  });
}

/**
 * 更新文件夹
 */
export function fetchFileManagerUpdateFolder(data: UpdateFolderRequestDto) {
  return apiRequest<FolderResponseDto>({
    method: 'PUT',
    url: '/system/file-manager/folder',
    data,
    operationId: 'FileManagerController_updateFolder_v1'
  });
}

/**
 * 删除文件夹
 */
export function fetchFileManagerDeleteFolder(folderId: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/file-manager/folder/{folderId}', { folderId }),
    operationId: 'FileManagerController_deleteFolder_v1'
  });
}

/**
 * 获取文件夹列表
 */
export function fetchFileManagerListFolders(params?: Record<string, unknown>) {
  return apiRequest<FolderResponseDto[]>({
    method: 'GET',
    url: '/system/file-manager/folder/list',
    params,
    operationId: 'FileManagerController_listFolders_v1'
  });
}

/**
 * 获取文件夹树
 */
export function fetchFileManagerGetFolderTree() {
  return apiRequest<FolderTreeNodeResponseDto[]>({
    method: 'GET',
    url: '/system/file-manager/folder/tree',
    operationId: 'FileManagerController_getFolderTree_v1'
  });
}

/**
 * 获取文件列表
 */
export function fetchFileManagerListFiles(params?: Record<string, unknown>) {
  return apiRequest<FileListResponseDto>({
    method: 'GET',
    url: '/system/file-manager/file/list',
    params,
    operationId: 'FileManagerController_listFiles_v1'
  });
}

/**
 * 移动文件
 */
export function fetchFileManagerMoveFiles(data: MoveFileRequestDto) {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/file-manager/file/move',
    data,
    operationId: 'FileManagerController_moveFiles_v1'
  });
}

/**
 * 重命名文件
 */
export function fetchFileManagerRenameFile(data: RenameFileRequestDto) {
  return apiRequest<FileResponseDto>({
    method: 'POST',
    url: '/system/file-manager/file/rename',
    data,
    operationId: 'FileManagerController_renameFile_v1'
  });
}

/**
 * 删除文件
 */
export function fetchFileManagerDeleteFiles() {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: '/system/file-manager/file',
    operationId: 'FileManagerController_deleteFiles_v1'
  });
}

/**
 * 获取文件详情
 */
export function fetchFileManagerGetFileDetail(uploadId: string | number) {
  return apiRequest<FileResponseDto>({
    method: 'GET',
    url: buildUrl('/system/file-manager/file/{uploadId}', { uploadId }),
    operationId: 'FileManagerController_getFileDetail_v1'
  });
}

/**
 * 创建分享链接
 */
export function fetchFileManagerCreateShare(data: CreateShareRequestDto) {
  return apiRequest<CreateShareResultResponseDto>({
    method: 'POST',
    url: '/system/file-manager/share',
    data,
    operationId: 'FileManagerController_createShare_v1'
  });
}

/**
 * 获取分享信息（无需登录）
 */
export function fetchFileManagerGetShare(shareId: string | number, params?: Record<string, unknown>) {
  return apiRequest<ShareInfoResponseDto>({
    method: 'GET',
    url: buildUrl('/system/file-manager/share/{shareId}', { shareId }),
    params,
    operationId: 'FileManagerController_getShare_v1'
  });
}

/**
 * 取消分享
 */
export function fetchFileManagerCancelShare(shareId: string | number) {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: buildUrl('/system/file-manager/share/{shareId}', { shareId }),
    operationId: 'FileManagerController_cancelShare_v1'
  });
}

/**
 * 下载分享文件（无需登录）
 */
export function fetchFileManagerDownloadShare(shareId: string | number) {
  return apiRequest<unknown>({
    method: 'POST',
    url: buildUrl('/system/file-manager/share/{shareId}/download', { shareId }),
    operationId: 'FileManagerController_downloadShare_v1'
  });
}

/**
 * 我的分享列表
 */
export function fetchFileManagerMyShares() {
  return apiRequest<ShareListResponseDto>({
    method: 'GET',
    url: '/system/file-manager/share/my/list',
    operationId: 'FileManagerController_myShares_v1'
  });
}

/**
 * 获取回收站文件列表
 */
export function fetchFileManagerGetRecycleList(params?: Record<string, unknown>) {
  return apiRequest<FileListResponseDto>({
    method: 'GET',
    url: '/system/file-manager/recycle/list',
    params,
    operationId: 'FileManagerController_getRecycleList_v1'
  });
}

/**
 * 恢复回收站文件
 */
export function fetchFileManagerRestoreFiles() {
  return apiRequest<unknown>({
    method: 'PUT',
    url: '/system/file-manager/recycle/restore',
    operationId: 'FileManagerController_restoreFiles_v1'
  });
}

/**
 * 彻底删除回收站文件
 */
export function fetchFileManagerClearRecycle() {
  return apiRequest<unknown>({
    method: 'DELETE',
    url: '/system/file-manager/recycle/clear',
    operationId: 'FileManagerController_clearRecycle_v1'
  });
}

/**
 * 获取文件版本历史
 */
export function fetchFileManagerGetFileVersions(uploadId: string | number) {
  return apiRequest<FileVersionListResponseDto>({
    method: 'GET',
    url: buildUrl('/system/file-manager/file/{uploadId}/versions', { uploadId }),
    operationId: 'FileManagerController_getFileVersions_v1'
  });
}

/**
 * 恢复到指定版本
 */
export function fetchFileManagerRestoreVersion() {
  return apiRequest<RestoreVersionResultResponseDto>({
    method: 'POST',
    url: '/system/file-manager/file/restore-version',
    operationId: 'FileManagerController_restoreVersion_v1'
  });
}

/**
 * 获取文件访问令牌
 */
export function fetchFileManagerGetAccessToken(uploadId: string | number) {
  return apiRequest<AccessTokenResponseDto>({
    method: 'GET',
    url: buildUrl('/system/file-manager/file/{uploadId}/access-token', { uploadId }),
    operationId: 'FileManagerController_getAccessToken_v1'
  });
}

/**
 * 下载文件（需要令牌）
 */
export function fetchFileManagerDownloadFile(uploadId: string | number, params?: Record<string, unknown>) {
  return apiRequest<unknown>({
    method: 'GET',
    url: buildUrl('/system/file-manager/file/{uploadId}/download', { uploadId }),
    params,
    operationId: 'FileManagerController_downloadFile_v1'
  });
}

/**
 * 批量下载文件（打包为zip）
 */
export function fetchFileManagerBatchDownload() {
  return apiRequest<unknown>({
    method: 'POST',
    url: '/system/file-manager/file/batch-download',
    operationId: 'FileManagerController_batchDownload_v1'
  });
}

/**
 * 获取存储使用统计
 */
export function fetchFileManagerGetStorageStats() {
  return apiRequest<StorageStatsResponseDto>({
    method: 'GET',
    url: '/system/file-manager/storage/stats',
    operationId: 'FileManagerController_getStorageStats_v1'
  });
}
