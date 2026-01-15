// 保留的手写 API - 这些 API 仍在使用中，因为：
// 1. 需要特殊的请求格式（如 FormData）
// 2. 后端尚未提供对应的 API

// 文件管理 - 需要 FormData 上传
export { fetchUploadFile, fetchBatchDeleteFiles } from './system/file-manager';
