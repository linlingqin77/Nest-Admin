/**
 * Button 组件测试示例
 *
 * @description
 * 演示如何测试 Vue 组件
 *
 * @requirements 11.3, 11.4
 */

import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

// 创建一个简单的 Button 组件用于测试演示
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

describe('Button 组件', () => {
  describe('渲染', () => {
    it('应该正确渲染默认按钮', () => {
      const wrapper = mount(TestButton);

      expect(wrapper.text()).toContain('按钮');
      expect(wrapper.classes()).toContain('test-button');
      expect(wrapper.classes()).toContain('test-button--default');
    });

    it('应该正确渲染自定义标签', () => {
      const wrapper = mount(TestButton, {
        props: {
          label: '提交'
        }
      });

      expect(wrapper.text()).toBe('提交');
    });

    it('应该正确应用不同的类型样式', () => {
      const types = ['default', 'primary', 'success', 'warning', 'error'] as const;

      types.forEach(type => {
        const wrapper = mount(TestButton, {
          props: { type }
        });

        expect(wrapper.classes()).toContain(`test-button--${type}`);
      });
    });
  });

  describe('交互', () => {
    it('应该在点击时触发 click 事件', async () => {
      const wrapper = mount(TestButton);

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeTruthy();
      expect(wrapper.emitted('click')?.length).toBe(1);
    });

    it('应该在 disabled 状态下不触发 click 事件', async () => {
      const wrapper = mount(TestButton, {
        props: {
          disabled: true
        }
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });

    it('应该在 loading 状态下不触发 click 事件', async () => {
      const wrapper = mount(TestButton, {
        props: {
          loading: true
        }
      });

      await wrapper.trigger('click');

      expect(wrapper.emitted('click')).toBeFalsy();
    });
  });

  describe('状态', () => {
    it('应该在 disabled 状态下添加 disabled 类', () => {
      const wrapper = mount(TestButton, {
        props: {
          disabled: true
        }
      });

      expect(wrapper.classes()).toContain('test-button--disabled');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('应该在 loading 状态下显示加载文本', () => {
      const wrapper = mount(TestButton, {
        props: {
          loading: true
        }
      });

      expect(wrapper.text()).toBe('加载中...');
      expect(wrapper.classes()).toContain('test-button--loading');
    });
  });

  describe('Props 验证', () => {
    it('应该接受有效的 type prop', () => {
      const validTypes = ['default', 'primary', 'success', 'warning', 'error'];

      validTypes.forEach(type => {
        const wrapper = mount(TestButton, {
          props: { type: type as any }
        });

        expect(wrapper.props('type')).toBe(type);
      });
    });

    it('应该使用默认 props 值', () => {
      const wrapper = mount(TestButton);

      expect(wrapper.props('label')).toBe('按钮');
      expect(wrapper.props('disabled')).toBe(false);
      expect(wrapper.props('type')).toBe('default');
      expect(wrapper.props('loading')).toBe(false);
    });
  });
});
