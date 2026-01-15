/**
 * 设备类型枚举
 */
export enum DeviceTypeEnum {
  /** PC端 */
  PC = 'pc',
  /** 移动端 */
  APP = 'app',
  /** 小程序 */
  MINI = 'mini',
  /** 社交登录 */
  SOCIAL = 'social',
}

/** DeviceTypeEnum Swagger Schema */
export const DeviceTypeEnumSchema = {
  description: `设备类型枚举
- PC (pc): PC端
- APP (app): 移动端
- MINI (mini): 小程序
- SOCIAL (social): 社交登录`,
};
