/**
 * 前端测试辅助函数索引
 *
 * @description
 * 导出所有前端测试辅助函数
 */

// 组件挂载辅助函数
export {
  createTestPinia,
  createTestRouter,
  mountComponent,
  shallowMountComponent,
  waitForUpdate,
  submitForm,
  fillInput,
  clickButton,
  type ComponentMountOptions
} from './mount.helper';

// 断言辅助函数
export {
  expectComponentExists,
  expectComponentNotExists,
  expectComponentText,
  expectComponentVisible,
  expectComponentHidden,
  expectComponentDisabled,
  expectComponentEnabled,
  expectEventEmitted,
  expectEventNotEmitted,
  expectEventPayload,
  expectProps,
  expectHasClass,
  expectNotHasClass,
  expectInputValue,
  expectListLength,
  expectLoading,
  expectNotLoading,
  expectErrorMessage,
  expectFormError
} from './assertion.helper';
