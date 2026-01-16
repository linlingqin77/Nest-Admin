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

/** 批量删除文件 */
export function fetchBatchDeleteFiles(uploadIds: string[]) {
  return request<boolean>({
    url: '/system/file-manager/file',
    method: 'delete',
    data: { uploadIds }
  });
}
