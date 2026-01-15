// 保留的手写 API - 这些 API 仍在使用中

// 用户管理 - 头像上传需要 FormData，部门树
export { fetchUpdateUserAvatar, fetchGetDeptTree } from './user';

// 社交登录 - 后端未完全实现
export { fetchSocialAuthBinding, fetchSocialAuthUnbinding, fetchSocialList } from './social';

// 文件管理 - 需要 FormData 上传
export { fetchUploadFile, fetchBatchDeleteFiles } from './file-manager';

// 租户套餐 - 状态变更 API
export * from './tenant-package';

// 租户管理 - 切换、配额、审计、仪表盘
export * from './tenant';

// OSS 文件管理 - 保留 fetchUploadFile（需要 FormData）
export { fetchUploadFile as fetchOssUploadFile } from './oss';

// 系统配置
export * from './config';

// 通知消息
export * from './notify';

// 已迁移到 api-gen 的 API:
// - 客户端管理 (client.ts) -> fetchClientFindAll, fetchClientCreate, fetchClientUpdate, fetchClientChangeStatus, fetchClientRemove
// - OSS 配置管理 (oss-config.ts) -> fetchOssConfigFindAll, fetchOssConfigCreate, fetchOssConfigUpdate, fetchOssConfigChangeStatus, fetchOssConfigRemove
// - OSS 文件管理 (oss.ts) -> fetchOssFindAll, fetchOssFindByIds, fetchOssRemove
