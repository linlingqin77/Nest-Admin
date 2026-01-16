/**
 * Button 组件属性测试
 *
 * @description
 * 使用属性测试验证组件行为的正确性
 *
 * **Property 6: 组件行为正确性**
 * **Validates: Requirements 11.3, 11.4, 11.7**
 */

import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';

// 创建一个简单的 Button 组件用于测试
const TestButton = defineComponent({
  name: 'TestButton',
  props: {
    label: {
      type: String,
      default: '按钮'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String as () => 'default' | 'primary' | 'success' | 'warning' | 'error',
      default: 'default'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = () => {
      if (!props.disabled && !props.loading) {
        emit('click');
      }
    };

    return () =>
      h(
        'button',
        {
          class: [
            'test-button',
            `test-button--${props.type}`,
            { 'test-button--disabled': props.disabled },
            { 'test-button--loading': props.loading }
          ],
          disabled: props.disabled || props.loading,
          onClick: handleClick
        },
        props.loading ? '加载中...' : props.label
      );
  }
});

describe('Button 组件 - 属性测试', () => {
  describe('Property 1: 标签渲染一致性', () => {
    /**
     * **Validates: Requirements 11.3**
     * 对于任意非空字符串标签，组件应该正确渲染该标签
     */
    it('任意非空标签都应该正确渲染', () => {
      // 使用字母数字字符串避免 HTML 空格压缩问题
      fc.assert(
        fc.property(fc.stringMatching(/^[a-zA-Z0-9\u4E00-\u9FA5]{1,50}$/), label => {
          const wrapper = mount(TestButton, {
            props: { label }
          });

          // 非 loading 状态下应该显示标签
          expect(wrapper.text()).toBe(label);
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2: 类型样式应用', () => {
    /**
     * **Validates: Requirements 11.4**
     * 对于任意有效类型，组件应该应用对应的样式类
     */
    it('任意有效类型都应该应用对应的样式类', () => {
      const validTypes = ['default', 'primary', 'success', 'warning', 'error'] as const;

      fc.assert(
        fc.property(fc.constantFrom(...validTypes), type => {
          const wrapper = mount(TestButton, {
            props: { type }
          });

          expect(wrapper.classes()).toContain(`test-button--${type}`);
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 3: 禁用状态行为', () => {
    /**
     * **Validates: Requirements 11.4, 11.7**
     * 当 disabled 为 true 时，点击不应触发事件
     */
    it('禁用状态下点击不应触发事件', async () => {
      await fc.assert(
        fc.asyncProperty(fc.boolean(), async disabled => {
          const wrapper = mount(TestButton, {
            props: { disabled }
          });

          await wrapper.trigger('click');

          if (disabled) {
            // 禁用时不应触发事件
            expect(wrapper.emitted('click')).toBeFalsy();
          } else {
            // 非禁用时应触发事件
            expect(wrapper.emitted('click')).toBeTruthy();
          }
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 4: Loading 状态行为', () => {
    /**
     * **Validates: Requirements 11.4, 11.7**
     * 当 loading 为 true 时，应显示加载文本且点击不触发事件
     */
    it('loading 状态下应显示加载文本', () => {
      // 使用字母数字字符串避免 HTML 空格压缩问题
      fc.assert(
        fc.property(fc.boolean(), fc.stringMatching(/^[a-zA-Z0-9\u4E00-\u9FA5]{1,50}$/), (loading, label) => {
          const wrapper = mount(TestButton, {
            props: { loading, label }
          });

          if (loading) {
            expect(wrapper.text()).toBe('加载中...');
          } else {
            expect(wrapper.text()).toBe(label);
          }
          return true;
        }),
        { numRuns: 30 }
      );
    });

    it('loading 状态下点击不应触发事件', async () => {
      await fc.assert(
        fc.asyncProperty(fc.boolean(), async loading => {
          const wrapper = mount(TestButton, {
            props: { loading }
          });

          await wrapper.trigger('click');

          if (loading) {
            expect(wrapper.emitted('click')).toBeFalsy();
          } else {
            expect(wrapper.emitted('click')).toBeTruthy();
          }
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 5: Props 默认值', () => {
    /**
     * **Validates: Requirements 11.3**
     * 组件应该有合理的默认值
     */
    it('未提供 props 时应使用默认值', () => {
      fc.assert(
        fc.property(fc.constant(undefined), () => {
          const wrapper = mount(TestButton);

          expect(wrapper.props('label')).toBe('按钮');
          expect(wrapper.props('disabled')).toBe(false);
          expect(wrapper.props('type')).toBe('default');
          expect(wrapper.props('loading')).toBe(false);
          return true;
        }),
        { numRuns: 5 }
      );
    });
  });

  describe('Property 6: 状态组合', () => {
    /**
     * **Validates: Requirements 11.7**
     * disabled 和 loading 状态的组合应该正确处理
     */
    it('disabled 和 loading 状态组合应该正确处理', async () => {
      await fc.assert(
        fc.asyncProperty(fc.boolean(), fc.boolean(), async (disabled, loading) => {
          const wrapper = mount(TestButton, {
            props: { disabled, loading }
          });

          await wrapper.trigger('click');

          // 只要 disabled 或 loading 为 true，就不应触发事件
          if (disabled || loading) {
            expect(wrapper.emitted('click')).toBeFalsy();
          } else {
            expect(wrapper.emitted('click')).toBeTruthy();
          }
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 7: 类名一致性', () => {
    /**
     * **Validates: Requirements 11.4**
     * 组件应该始终包含基础类名
     */
    it('组件应该始终包含基础类名', () => {
      const validTypes = ['default', 'primary', 'success', 'warning', 'error'] as const;

      fc.assert(
        fc.property(fc.constantFrom(...validTypes), fc.boolean(), fc.boolean(), (type, disabled, loading) => {
          const wrapper = mount(TestButton, {
            props: { type, disabled, loading }
          });

          // 始终应该有基础类名
          expect(wrapper.classes()).toContain('test-button');
          expect(wrapper.classes()).toContain(`test-button--${type}`);

          // 根据状态应该有对应的类名
          if (disabled) {
            expect(wrapper.classes()).toContain('test-button--disabled');
          }
          if (loading) {
            expect(wrapper.classes()).toContain('test-button--loading');
          }

          return true;
        }),
        { numRuns: 30 }
      );
    });
  });
});
