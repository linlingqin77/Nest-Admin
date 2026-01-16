/**
 * 前端测试设置文件
 *
 * @description
 * 配置测试环境、全局 Mock 和 MSW 服务器
 *
 * @requirements 14.1
 */

import { config } from '@vue/test-utils';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = IntersectionObserverMock as any;

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// 配置 Vue Test Utils
config.global.stubs = {
  // 存根 Naive UI 组件以避免渲染问题
  NButton: true,
  NInput: true,
  NForm: true,
  NFormItem: true,
  NCard: true,
  NModal: true,
  NTable: true,
  NDataTable: true,
  NSpace: true,
  NGrid: true,
  NGridItem: true,
  NIcon: true,
  NSpin: true,
  NEmpty: true,
  NResult: true,
  NAlert: true,
  NTag: true,
  NBadge: true,
  NAvatar: true,
  NDropdown: true,
  NMenu: true,
  NLayout: true,
  NLayoutSider: true,
  NLayoutHeader: true,
  NLayoutContent: true,
  NLayoutFooter: true,
  // 存根路由组件
  RouterLink: true,
  RouterView: true
};

// 全局测试钩子
beforeAll(() => {
  // 测试开始前的设置
  console.log('🧪 前端测试环境已初始化');
});

afterEach(() => {
  // 每个测试后清理
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

afterAll(() => {
  // 所有测试完成后的清理
  console.log('✅ 前端测试完成');
});

// 导出 Mock 对象供测试使用
export { localStorageMock, sessionStorageMock };
