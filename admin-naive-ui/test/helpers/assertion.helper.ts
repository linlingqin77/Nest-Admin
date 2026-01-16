/**
 * 前端断言辅助函数
 *
 * @description
 * 提供前端测试的断言辅助函数
 *
 * @requirements 7.1
 */

import type { VueWrapper } from '@vue/test-utils';
import { expect } from 'vitest';

/**
 * 验证组件是否存在
 */
export const expectComponentExists = (wrapper: VueWrapper<any>, selector: string): void => {
  expect(wrapper.find(selector).exists()).toBe(true);
};

/**
 * 验证组件是否不存在
 */
export const expectComponentNotExists = (wrapper: VueWrapper<any>, selector: string): void => {
  expect(wrapper.find(selector).exists()).toBe(false);
};

/**
 * 验证组件文本内容
 */
export const expectComponentText = (wrapper: VueWrapper<any>, selector: string, expectedText: string): void => {
  expect(wrapper.find(selector).text()).toContain(expectedText);
};

/**
 * 验证组件是否可见
 */
export const expectComponentVisible = (wrapper: VueWrapper<any>, selector: string): void => {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  expect(element.isVisible()).toBe(true);
};

/**
 * 验证组件是否隐藏
 */
export const expectComponentHidden = (wrapper: VueWrapper<any>, selector: string): void => {
  const element = wrapper.find(selector);
  if (element.exists()) {
    expect(element.isVisible()).toBe(false);
  }
};

/**
 * 验证组件是否禁用
 */
export const expectComponentDisabled = (wrapper: VueWrapper<any>, selector: string): void => {
  const element = wrapper.find(selector);
  expect(element.attributes('disabled')).toBeDefined();
};

/**
 * 验证组件是否启用
 */
export const expectComponentEnabled = (wrapper: VueWrapper<any>, selector: string): void => {
  const element = wrapper.find(selector);
  expect(element.attributes('disabled')).toBeUndefined();
};

/**
 * 验证事件是否被触发
 */
export const expectEventEmitted = (wrapper: VueWrapper<any>, eventName: string, times = 1): void => {
  const emitted = wrapper.emitted(eventName);
  expect(emitted).toBeTruthy();
  expect(emitted?.length).toBe(times);
};

/**
 * 验证事件是否未被触发
 */
export const expectEventNotEmitted = (wrapper: VueWrapper<any>, eventName: string): void => {
  expect(wrapper.emitted(eventName)).toBeFalsy();
};

/**
 * 验证事件参数
 */
export const expectEventPayload = <T>(
  wrapper: VueWrapper<any>,
  eventName: string,
  expectedPayload: T,
  eventIndex = 0
): void => {
  const emitted = wrapper.emitted(eventName);
  expect(emitted).toBeTruthy();
  expect(emitted?.[eventIndex]?.[0]).toEqual(expectedPayload);
};

/**
 * 验证组件 Props
 */
export const expectProps = (wrapper: VueWrapper<any>, expectedProps: Record<string, any>): void => {
  Object.entries(expectedProps).forEach(([key, value]) => {
    expect(wrapper.props(key)).toEqual(value);
  });
};

/**
 * 验证组件类名
 */
export const expectHasClass = (wrapper: VueWrapper<any>, selector: string, className: string): void => {
  expect(wrapper.find(selector).classes()).toContain(className);
};

/**
 * 验证组件没有类名
 */
export const expectNotHasClass = (wrapper: VueWrapper<any>, selector: string, className: string): void => {
  expect(wrapper.find(selector).classes()).not.toContain(className);
};

/**
 * 验证输入框值
 */
export const expectInputValue = (wrapper: VueWrapper<any>, selector: string, expectedValue: string): void => {
  const input = wrapper.find(selector);
  expect((input.element as HTMLInputElement).value).toBe(expectedValue);
};

/**
 * 验证列表长度
 */
export const expectListLength = (wrapper: VueWrapper<any>, selector: string, expectedLength: number): void => {
  expect(wrapper.findAll(selector).length).toBe(expectedLength);
};

/**
 * 验证加载状态
 */
export const expectLoading = (wrapper: VueWrapper<any>, loadingSelector = '.n-spin'): void => {
  expectComponentExists(wrapper, loadingSelector);
};

/**
 * 验证非加载状态
 */
export const expectNotLoading = (wrapper: VueWrapper<any>, loadingSelector = '.n-spin'): void => {
  expectComponentNotExists(wrapper, loadingSelector);
};

/**
 * 验证错误消息
 */
export const expectErrorMessage = (wrapper: VueWrapper<any>, errorSelector: string, expectedMessage: string): void => {
  const errorElement = wrapper.find(errorSelector);
  expect(errorElement.exists()).toBe(true);
  expect(errorElement.text()).toContain(expectedMessage);
};

/**
 * 验证表单验证错误
 */
export const expectFormError = (wrapper: VueWrapper<any>, fieldName: string, expectedError: string): void => {
  const errorSelector = `[data-field="${fieldName}"] .n-form-item-feedback`;
  expectErrorMessage(wrapper, errorSelector, expectedError);
};

export default {
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
};
