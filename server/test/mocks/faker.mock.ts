/**
 * Faker Mock 实现
 *
 * @description
 * 提供与 @faker-js/faker 兼容的 mock 实现
 * 用于解决 Jest 中 ESM 模块兼容性问题
 */

// 简单的随机数生成器
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const randomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const randomAlphanumeric = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 计数器用于生成唯一值
let counter = 0;
const getUniqueId = (): number => ++counter;

// 重置计数器（用于测试隔离）
export const resetFakerCounter = (): void => {
  counter = 0;
};

/**
 * Faker Mock 对象
 */
export const faker = {
  number: {
    int: (options?: { min?: number; max?: number }): number => {
      const min = options?.min ?? 1;
      const max = options?.max ?? 99999;
      // 使用唯一 ID 确保每次调用返回不同值
      return min + (getUniqueId() % (max - min + 1));
    },
  },

  string: {
    numeric: (length: number): string => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
      }
      return result;
    },
    alphanumeric: (length: number): string => randomAlphanumeric(length),
    uuid: (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  },

  internet: {
    username: (): string => `user_${getUniqueId()}_${randomString(6)}`,
    email: (): string => `user_${getUniqueId()}@test.example.com`,
    ip: (): string => `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    domainName: (): string => `domain-${getUniqueId()}.example.com`,
  },

  person: {
    fullName: (): string => `测试用户${getUniqueId()}`,
    jobTitle: (): string => `职位${getUniqueId()}`,
    jobType: (): string => `job_type_${getUniqueId()}`,
  },

  company: {
    name: (): string => `测试公司${getUniqueId()}`,
    catchPhrase: (): string => `公司口号${getUniqueId()}`,
  },

  location: {
    streetAddress: (): string => `测试地址${getUniqueId()}号`,
  },

  image: {
    avatar: (): string => `https://example.com/avatar/${getUniqueId()}.png`,
  },

  date: {
    past: (options?: { years?: number }): Date => {
      const years = options?.years ?? 1;
      const now = new Date();
      const pastDate = new Date(now.getTime() - randomInt(1, years * 365) * 24 * 60 * 60 * 1000);
      return pastDate;
    },
    recent: (options?: { days?: number }): Date => {
      const days = options?.days ?? 7;
      const now = new Date();
      const recentDate = new Date(now.getTime() - randomInt(1, days) * 24 * 60 * 60 * 1000);
      return recentDate;
    },
    future: (options?: { years?: number }): Date => {
      const years = options?.years ?? 1;
      const now = new Date();
      const futureDate = new Date(now.getTime() + randomInt(1, years * 365) * 24 * 60 * 60 * 1000);
      return futureDate;
    },
  },

  lorem: {
    sentence: (): string => `这是一个测试句子${getUniqueId()}。`,
    paragraph: (): string => `这是一个测试段落${getUniqueId()}。包含多个句子用于测试。`,
  },

  datatype: {
    boolean: (): boolean => Math.random() > 0.5,
  },

  helpers: {
    arrayElement: <T>(arr: T[]): T => randomElement(arr),
    slugify: (str: string): string =>
      str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, ''),
  },
};

export default faker;
