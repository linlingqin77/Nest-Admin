// 请求 DTO
export * from './requests';

// 响应 DTO
export * from './responses';

// 兼容旧导出
export { CreateOssConfigRequestDto as CreateOssConfigDto } from './requests';
export { UpdateOssConfigRequestDto as UpdateOssConfigDto } from './requests';
export { ChangeOssConfigStatusRequestDto as ChangeOssConfigStatusDto } from './requests';
export { ListOssConfigRequestDto as ListOssConfigDto } from './requests';
