import { request } from '@/service/request';

/** 上传文件到指定文件夹 */
export function fetchUploadFile(file: File, folderId?: number) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId !== undefined && folderId !== 0) {
        formData.append('folderId', String(folderId));
    }
    return request<Api.System.FileInfo>({
        url: '/common/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/** 获取文件夹列表 */
export function fetchGetFolderList(params?: Api.System.FileManager.FolderSearchParams) {
    return request<Api.System.FileManager.FolderList>({
        url: '/system/file-manager/folder/list',
        method: 'get',
        params
    });
}

/** 获取文件夹树 */
export function fetchGetFolderTree() {
    return request<Api.System.FileManager.FolderTreeNode[]>({
        url: '/system/file-manager/folder/tree',
        method: 'get'
    });
}

/** 创建文件夹 */
export function fetchCreateFolder(data: Api.System.FileManager.FolderOperateParams) {
    return request<boolean>({
        url: '/system/file-manager/folder',
        method: 'post',
        data
    });
}

/** 修改文件夹 */
export function fetchUpdateFolder(data: Api.System.FileManager.FolderOperateParams) {
    return request<boolean>({
        url: '/system/file-manager/folder',
        method: 'put',
        data
    });
}

/** 删除文件夹 */
export function fetchDeleteFolder(folderId: number) {
    return request<boolean>({
        url: `/system/file-manager/folder/${folderId}`,
        method: 'delete'
    });
}

/** 获取文件列表 */
export function fetchGetFileList(params?: Api.System.FileManager.FileSearchParams) {
    return request<Api.System.FileManager.FileList>({
        url: '/system/file-manager/file/list',
        method: 'get',
        params
    });
}

/** 移动文件 */
export function fetchMoveFiles(data: Api.System.FileManager.MoveFilesParams) {
    return request<boolean>({
        url: '/system/file-manager/file/move',
        method: 'post',
        data
    });
}

/** 重命名文件 */
export function fetchRenameFile(data: Api.System.FileManager.RenameFileParams) {
    return request<boolean>({
        url: '/system/file-manager/file/rename',
        method: 'post',
        data
    });
}

/** 批量删除文件 */
export function fetchBatchDeleteFiles(uploadIds: string[]) {
    return request<boolean>({
        url: '/system/file-manager/file',
        method: 'delete',
        data: { uploadIds }
    });
}

/** 获取文件详情 */
export function fetchGetFileDetail(uploadId: string) {
    return request<Api.System.FileManager.FileDetail>({
        url: `/system/file-manager/file/${uploadId}`,
        method: 'get'
    });
}

/** 创建分享 */
export function fetchCreateShare(data: Api.System.FileManager.CreateShareParams) {
    return request<Api.System.FileManager.ShareInfo>({
        url: '/system/file-manager/share',
        method: 'post',
        data
    });
}

/** 获取分享详情 */
export function fetchGetShare(data: Api.System.FileManager.GetShareParams) {
    return request<Api.System.FileManager.ShareDetail>({
        url: `/system/file-manager/share/${data.shareId}`,
        method: 'get',
        params: { shareCode: data.shareCode, password: data.password }
    });
}

/** 取消分享 */
export function fetchCancelShare(shareId: number) {
    return request<boolean>({
        url: `/system/file-manager/share/${shareId}`,
        method: 'delete'
    });
}

/** 获取我的分享列表 */
export function fetchGetMyShares(params?: Api.System.FileManager.ShareSearchParams) {
    return request<Api.System.FileManager.ShareList>({
        url: '/system/file-manager/share/my/list',
        method: 'get',
        params
    });
}
