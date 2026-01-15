import { request } from '@/service/request';

/** 获取部门树列表 */
export function fetchGetDeptTree() {
  return request<Api.Common.CommonTreeRecord>({
    url: '/system/user/deptTree',
    method: 'get',
  });
}

/** 修改用户头像 - 需要 FormData 上传 */
export function fetchUpdateUserAvatar(formData: FormData) {
  return request<boolean>({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: formData,
  });
}
