/**
 * 组件挂载辅助函数
 *
 * @description
 * 提供 Vue 组件测试的挂载辅助函数
 *
 * @requirements 11.5, 11.6
 */

import { mount, shallowMount, VueWrapper, MountingOptions } from '@vue/test-utils';
import { createPinia, setActivePinia, Pinia } from 'pinia';
import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router';
import { Component, h } from 'vue';

/**
 * 默认路由配置
 */
const defaultRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' },
  },
  {
    path: '/login',
    name: 'login',
    component: { template: '<div>Login</div>' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: { template: '<div>Dashboard</div>' },
  },
  {
    path: '/system/user',
    name: 'system-user',
    component: { template: '<div>User Management</div>' },
  },
];

/**
 * 创建测试用 Pinia 实例
 */
export const createTestPinia = (): Pinia => {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
};

/**
 * 创建测试用 Router 实例
 */
export const createTestRouter = (routes: RouteRecordRaw[] = defaultRoutes): Router => {
  return createRouter({
    history: createWebHistory(),
    routes,
  });
};

/**
 * 组件挂载选项
 */
export interface ComponentMountOptions<T = any> extends MountingOptions<T> {
  /** 是否使用 Pinia */
  withPinia?: boolean;
  /** 是否使用 Router */
  withRouter?: boolean;
  /** 自定义路由配置 */
  routes?: RouteRecordRaw[];
  /** 初始路由路径 */
  initialRoute?: string;
}

/**
 * 挂载组件（完整挂载）
 *
 * @param component 要挂载的组件
 * @param options 挂载选项
 * @returns VueWrapper 实例
 *
 * @example
 * ```typescript
 * const wrapper = await mountComponent(MyComponent, {
 *   props: { title: 'Test' },
 *   withPinia: true,
 *   withRouter: true,
 * });
 * ```
 */
export const mountComponent = async <T extends Component>(
  component: T,
  options: ComponentMountOptions = {},
): Promise<VueWrapper<any>> => {
  const {
    withPinia = false,
    withRouter = false,
    routes = defaultRoutes,
    initialRoute = '/',
    global = {},
    ...restOptions
  } = options;

  const plugins: any[] = global.plugins || [];
  const stubs = global.stubs || {};

  // 添加 Pinia
  if (withPinia) {
    plugins.push(createTestPinia());
  }

  // 添加 Router
  let router: Router | undefined;
  if (withRouter) {
    router = createTestRouter(routes);
    plugins.push(router);
    await router.push(initialRoute);
    await router.isReady();
  }

  const wrapper = mount(component, {
    ...restOptions,
    global: {
      ...global,
      plugins,
      stubs: {
        // 默认存根 Naive UI 组件
        NButton: true,
        NInput: true,
        NForm: true,
        NFormItem: true,
        NCard: true,
        NModal: true,
        NTable: true,
        NDataTable: true,
        NSpace: true,
        NIcon: true,
        NSpin: true,
        ...stubs,
      },
    },
  } as any);

  return wrapper;
};

/**
 * 浅挂载组件
 *
 * @param component 要挂载的组件
 * @param options 挂载选项
 * @returns VueWrapper 实例
 */
export const shallowMountComponent = async <T extends Component>(
  component: T,
  options: ComponentMountOptions = {},
): Promise<VueWrapper<any>> => {
  const {
    withPinia = false,
    withRouter = false,
    routes = defaultRoutes,
    initialRoute = '/',
    global = {},
    ...restOptions
  } = options;

  const plugins: any[] = global.plugins || [];

  if (withPinia) {
    plugins.push(createTestPinia());
  }

  let router: Router | undefined;
  if (withRouter) {
    router = createTestRouter(routes);
    plugins.push(router);
    await router.push(initialRoute);
    await router.isReady();
  }

  return shallowMount(component, {
    ...restOptions,
    global: {
      ...global,
      plugins,
    },
  } as any);
};

/**
 * 等待组件更新
 *
 * @param wrapper VueWrapper 实例
 * @param timeout 超时时间（毫秒）
 */
export const waitForUpdate = async (
  wrapper: VueWrapper<any>,
  timeout = 100,
): Promise<void> => {
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, timeout));
};

/**
 * 触发表单提交
 *
 * @param wrapper VueWrapper 实例
 * @param formSelector 表单选择器
 */
export const submitForm = async (
  wrapper: VueWrapper<any>,
  formSelector = 'form',
): Promise<void> => {
  const form = wrapper.find(formSelector);
  await form.trigger('submit');
  await waitForUpdate(wrapper);
};

/**
 * 填写输入框
 *
 * @param wrapper VueWrapper 实例
 * @param selector 输入框选择器
 * @param value 输入值
 */
export const fillInput = async (
  wrapper: VueWrapper<any>,
  selector: string,
  value: string,
): Promise<void> => {
  const input = wrapper.find(selector);
  await input.setValue(value);
  await waitForUpdate(wrapper);
};

/**
 * 点击按钮
 *
 * @param wrapper VueWrapper 实例
 * @param selector 按钮选择器
 */
export const clickButton = async (
  wrapper: VueWrapper<any>,
  selector: string,
): Promise<void> => {
  const button = wrapper.find(selector);
  await button.trigger('click');
  await waitForUpdate(wrapper);
};

export default {
  createTestPinia,
  createTestRouter,
  mountComponent,
  shallowMountComponent,
  waitForUpdate,
  submitForm,
  fillInput,
  clickButton,
};
