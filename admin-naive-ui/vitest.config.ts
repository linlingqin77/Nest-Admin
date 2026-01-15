/**
 * Vitest 配置文件
 *
 * @description
 * 前端测试配置，包含覆盖率阈值和测试环境设置
 * 支持单元测试、组件测试和属性测试
 *
 * @requirements 1.4, 1.5, 1.7
 */
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    // 全局 API
    globals: true,

    // 测试环境
    environment: 'jsdom',

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'test/**/*.{test,spec}.{js,ts}',
    ],

    // 排除的文件
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.d.ts',
    ],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'test/**',
        '**/*.config.*',
        '**/types/**',
        '**/typings/**',
      ],
      // 企业级覆盖率阈值
      thresholds: {
        global: {
          branches: 60,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // 测试设置文件
    setupFiles: ['./test/setup.ts'],

    // 测试超时时间
    testTimeout: 10000,

    // 服务器配置
    server: {
      deps: {
        inline: ['naive-ui', '@vueuse/core'],
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
    },
  },
});
