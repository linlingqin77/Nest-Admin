// 保留的手写 API - 这些 API 仍在使用中

// 在线设备管理 - 后端未完全实现
export { fetchGetOnlineDeviceList, fetchKickOutCurrentDevice } from './online';

// 定时任务 - 生成的 API 缺少 data 参数
export { fetchUpdateJob, fetchChangeJobStatus, fetchRunJob } from './job';

// 任务日志 - 支持批量删除
export { fetchDeleteJobLog } from './job-log';
