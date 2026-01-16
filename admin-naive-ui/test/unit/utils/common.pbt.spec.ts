/**
 * 通用工具函数属性测试
 *
 * @description
 * 使用属性测试验证工具函数的正确性
 *
 * **Validates: Requirements 13.3**
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fc from 'fast-check';

/**
 * 日期格式化函数
 */
const formatDate = (date: Date | string | null | undefined, format = 'YYYY-MM-DD'): string => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 日期解析函数
 */
const parseDate = (dateStr: string, format = 'YYYY-MM-DD'): Date => {
  const parts: Record<string, number> = {};

  // 提取格式中各部分的位置
  const yearIndex = format.indexOf('YYYY');
  const monthIndex = format.indexOf('MM');
  const dayIndex = format.indexOf('DD');
  const hourIndex = format.indexOf('HH');
  const minuteIndex = format.indexOf('mm');
  const secondIndex = format.indexOf('ss');

  if (yearIndex !== -1) parts.year = Number.parseInt(dateStr.substring(yearIndex, yearIndex + 4), 10);
  if (monthIndex !== -1) parts.month = Number.parseInt(dateStr.substring(monthIndex, monthIndex + 2), 10);
  if (dayIndex !== -1) parts.day = Number.parseInt(dateStr.substring(dayIndex, dayIndex + 2), 10);
  if (hourIndex !== -1) parts.hour = Number.parseInt(dateStr.substring(hourIndex, hourIndex + 2), 10);
  if (minuteIndex !== -1) parts.minute = Number.parseInt(dateStr.substring(minuteIndex, minuteIndex + 2), 10);
  if (secondIndex !== -1) parts.second = Number.parseInt(dateStr.substring(secondIndex, secondIndex + 2), 10);

  return new Date(
    parts.year || 0,
    (parts.month || 1) - 1,
    parts.day || 1,
    parts.hour || 0,
    parts.minute || 0,
    parts.second || 0
  );
};

/**
 * 深拷贝函数
 */
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * 防抖函数
 */
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

describe('formatDate - 属性测试', () => {
  describe('Property 1: 日期格式化往返一致性', () => {
    /**
     * **Validates: Requirements 13.3**
     * 对于任意有效日期，格式化后再解析应该得到相同的日期（精确到秒）
     */
    it('formatDate 和 parseDate 应该是可逆的', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          date => {
            const format = 'YYYY-MM-DD HH:mm:ss';
            const formatted = formatDate(date, format);
            if (!formatted) return true; // 跳过无效日期

            const parsed = parseDate(formatted, format);

            // 比较到秒级别（忽略毫秒）
            const originalSeconds = Math.floor(date.getTime() / 1000);
            const parsedSeconds = Math.floor(parsed.getTime() / 1000);

            return originalSeconds === parsedSeconds;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: 格式化输出长度一致', () => {
    /**
     * **Validates: Requirements 13.3**
     * 对于相同格式，有效日期的输出长度应该一致
     */
    it('相同格式的输出长度应该一致', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          (date1, date2) => {
            const format = 'YYYY-MM-DD';
            const result1 = formatDate(date1, format);
            const result2 = formatDate(date2, format);
            // 只有当两个结果都非空时才比较长度
            if (result1 && result2) {
              return result1.length === result2.length;
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: 空值处理', () => {
    /**
     * **Validates: Requirements 13.3**
     * null 和 undefined 应该返回空字符串
     */
    it('null 和 undefined 应该返回空字符串', () => {
      fc.assert(
        fc.property(fc.constantFrom(null, undefined), value => {
          return formatDate(value) === '';
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('Property 4: 格式化结果包含正确的年月日', () => {
    /**
     * **Validates: Requirements 13.3**
     * 格式化结果应该包含正确的年、月、日
     */
    it('格式化结果应该包含正确的年月日', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }).filter(d => !isNaN(d.getTime())),
          date => {
            const formatted = formatDate(date, 'YYYY-MM-DD');
            if (!formatted) return true; // 跳过无效日期

            const [year, month, day] = formatted.split('-').map(Number);

            return year === date.getFullYear() && month === date.getMonth() + 1 && day === date.getDate();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('deepClone - 属性测试', () => {
  describe('Property 1: 克隆等价性', () => {
    /**
     * **Validates: Requirements 13.3**
     * 克隆后的对象应该与原对象深度相等
     */
    it('克隆后的对象应该与原对象深度相等', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.string(),
            fc.boolean(),
            fc.constant(null),
            fc.array(fc.integer()),
            fc.record({ a: fc.integer(), b: fc.string() })
          ),
          value => {
            const cloned = deepClone(value);
            return JSON.stringify(cloned) === JSON.stringify(value);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: 克隆独立性', () => {
    /**
     * **Validates: Requirements 13.3**
     * 修改克隆对象不应影响原对象
     */
    it('修改克隆对象不应影响原对象', () => {
      fc.assert(
        fc.property(fc.record({ a: fc.integer(), b: fc.integer() }), obj => {
          const original = { ...obj };
          const cloned = deepClone(obj);

          // 修改克隆对象
          cloned.a += 1000;
          cloned.b += 1000;

          // 原对象应该不变
          return obj.a === original.a && obj.b === original.b;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: 嵌套对象克隆', () => {
    /**
     * **Validates: Requirements 13.3**
     * 嵌套对象也应该被正确克隆
     */
    it('嵌套对象也应该被正确克隆', () => {
      fc.assert(
        fc.property(
          fc.record({
            level1: fc.record({
              level2: fc.record({
                value: fc.integer()
              })
            })
          }),
          obj => {
            const cloned = deepClone(obj);

            // 修改克隆的嵌套对象
            cloned.level1.level2.value = cloned.level1.level2.value + 1000;

            // 原对象的嵌套值应该不变
            return obj.level1.level2.value !== cloned.level1.level2.value;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 4: 数组克隆', () => {
    /**
     * **Validates: Requirements 13.3**
     * 数组应该被正确克隆
     */
    it('数组应该被正确克隆', () => {
      fc.assert(
        fc.property(fc.array(fc.integer(), { minLength: 1, maxLength: 10 }), arr => {
          const cloned = deepClone(arr);

          // 克隆数组应该与原数组相等但不是同一个引用
          return JSON.stringify(cloned) === JSON.stringify(arr) && cloned !== arr && cloned.length === arr.length;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: 基本类型直接返回', () => {
    /**
     * **Validates: Requirements 13.3**
     * 基本类型应该直接返回
     */
    it('基本类型应该直接返回', () => {
      fc.assert(
        fc.property(fc.oneof(fc.integer(), fc.string(), fc.boolean()), value => {
          const cloned = deepClone(value);
          return cloned === value;
        }),
        { numRuns: 100 }
      );
    });
  });
});

describe('debounce - 属性测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Property 1: 延迟执行', () => {
    /**
     * **Validates: Requirements 13.3**
     * 防抖函数应该在指定延迟后执行
     */
    it('防抖函数应该在指定延迟后执行', () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 500 }), delay => {
          const fn = vi.fn();
          const debouncedFn = debounce(fn, delay);

          debouncedFn();

          // 延迟前不应执行
          expect(fn).not.toHaveBeenCalled();

          // 延迟后应执行
          vi.advanceTimersByTime(delay);
          expect(fn).toHaveBeenCalledTimes(1);

          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 2: 多次调用合并', () => {
    /**
     * **Validates: Requirements 13.3**
     * 多次快速调用应该只执行最后一次
     */
    it('多次快速调用应该只执行最后一次', () => {
      fc.assert(
        fc.property(fc.integer({ min: 10, max: 500 }), fc.integer({ min: 2, max: 10 }), (delay, callCount) => {
          const fn = vi.fn();
          const debouncedFn = debounce(fn, delay);

          // 多次调用
          for (let i = 0; i < callCount; i++) {
            debouncedFn();
          }

          // 延迟后应该只执行一次
          vi.advanceTimersByTime(delay);
          expect(fn).toHaveBeenCalledTimes(1);

          return true;
        }),
        { numRuns: 20 }
      );
    });
  });
});
