import { request } from '@/service/request';

/** 上传文件 */
export function fetchUploadFile(formData: FormData) {
  return request<Api.System.Oss>({
    url: '/resource/oss/upload',
    method: 'post',
    data: formData,
  });
}
