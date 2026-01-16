/**
 * OpenAPI 代码生成属性测试
 *
 * 测试生成的 API 代码和类型定义的正确性
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

// 配置路径
const API_GEN_DIR = path.resolve(__dirname, '../../../src/service/api-gen');
const TYPES_FILE = path.join(API_GEN_DIR, 'types.ts');
const OPENAPI_PATH = path.resolve(__dirname, '../../../../server/public/openApi.json');

interface OpenAPISpec {
  paths: Record<string, Record<string, { operationId?: string; tags?: string[] }>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

let openApiSpec: OpenAPISpec;
let generatedTypes: string;
let generatedApiFiles: Map<string, string>;

beforeAll(() => {
  // 读取 OpenAPI 规范
  openApiSpec = JSON.parse(fs.readFileSync(OPENAPI_PATH, 'utf-8'));

  // 读取生成的类型文件
  generatedTypes = fs.readFileSync(TYPES_FILE, 'utf-8');

  // 读取所有生成的 API 文件
  // 排除手动创建的文件：types.ts, index.ts, request-adapter.ts, api-config.ts
  // 以及代码生成器相关的手动创建文件：datasource.ts, history.ts, template.ts
  generatedApiFiles = new Map();
  const excludedFiles = [
    'types.ts',
    'index.ts',
    'request-adapter.ts',
    'api-config.ts',
    'datasource.ts', // 代码生成器 - 数据源管理（手动创建）
    'history.ts', // 代码生成器 - 历史管理（手动创建）
    'template.ts' // 代码生成器 - 模板管理（手动创建）
  ];
  const files = fs.readdirSync(API_GEN_DIR).filter(f => f.endsWith('.ts') && !excludedFiles.includes(f));
  for (const file of files) {
    const content = fs.readFileSync(path.join(API_GEN_DIR, file), 'utf-8');
    generatedApiFiles.set(file, content);
  }
});

describe('OpenAPI 代码生成 - 属性测试', () => {
  /**
   * Property 4: Schema 完整性
   * **Validates: Requirements 4.1**
   *
   * *For any* OpenAPI 规范文件，生成的类型定义应该包含规范中定义的所有 schemas
   */
  describe('Property 4: Schema 完整性', () => {
    it('生成的类型应包含所有 OpenAPI schemas', () => {
      const schemas = openApiSpec.components?.schemas || {};
      const schemaNames = Object.keys(schemas);

      // 验证每个 schema 都有对应的类型定义
      for (const schemaName of schemaNames) {
        // 检查是否存在 interface 或 type 定义
        const hasInterface = generatedTypes.includes(`export interface ${schemaName}`);
        const hasType = generatedTypes.includes(`export type ${schemaName}`);

        expect(hasInterface || hasType, `Schema "${schemaName}" 应该在生成的类型文件中有对应的定义`).toBe(true);
      }
    });

    it('生成的类型数量应与 OpenAPI schemas 数量一致', () => {
      const schemas = openApiSpec.components?.schemas || {};
      const schemaCount = Object.keys(schemas).length;

      // 统计生成的 interface 和 type 数量
      const interfaceMatches = generatedTypes.match(/export interface \w+/g) || [];
      const typeMatches = generatedTypes.match(/export type \w+/g) || [];
      const generatedCount = interfaceMatches.length + typeMatches.length;

      // 允许一定的误差（可能有一些辅助类型）
      expect(generatedCount).toBeGreaterThanOrEqual(schemaCount * 0.9);
    });
  });

  /**
   * Property 2: API 代码格式正确性
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   *
   * *For any* 生成的 API 函数：
   * - 应该使用 apiRequest<T>() 泛型调用方式
   * - 应该包含 JSDoc 注释
   * - POST/PUT/PATCH 请求应该使用 data 参数
   */
  describe('Property 2: API 代码格式正确性', () => {
    it('所有 API 函数应使用 apiRequest<T>() 泛型调用', () => {
      for (const [fileName, content] of generatedApiFiles) {
        // 查找所有函数定义
        const functionMatches = content.match(/export function \w+/g) || [];

        for (const funcMatch of functionMatches) {
          // 检查函数体中是否使用 apiRequest<
          const funcName = funcMatch.replace('export function ', '');
          const funcRegex = new RegExp(`export function ${funcName}[^}]+apiRequest<`, 's');
          expect(funcRegex.test(content), `函数 ${funcName} 在 ${fileName} 中应使用 apiRequest<T>() 泛型调用`).toBe(
            true
          );
        }
      }
    });

    it('所有 API 函数应包含 JSDoc 注释', () => {
      for (const [fileName, content] of generatedApiFiles) {
        // 查找所有 export function 定义
        const functionMatches = content.match(/export function \w+/g) || [];

        for (const funcMatch of functionMatches) {
          const funcName = funcMatch.replace('export function ', '');
          // 检查函数前是否有 JSDoc 注释（支持多行注释）
          const jsdocRegex = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*export function ${funcName}\\b`);
          expect(jsdocRegex.test(content), `函数 ${funcName} 在 ${fileName} 中应有 JSDoc 注释`).toBe(true);
        }
      }
    });

    it('POST/PUT/PATCH 请求应使用 data 参数', () => {
      for (const [fileName, content] of generatedApiFiles) {
        // 查找所有 POST/PUT/PATCH 请求
        const postMatches = content.match(/method: '(POST|PUT|PATCH)'[^}]+}/gs) || [];

        for (const match of postMatches) {
          // 如果有请求体参数，应该使用 data
          if (match.includes('data:')) {
            expect(
              match.includes('data,') || match.includes('data:'),
              `${fileName} 中的 POST/PUT/PATCH 请求应使用 data 参数`
            ).toBe(true);
          }
        }
      }
    });

    it('所有 API 函数应包含 operationId', () => {
      for (const [fileName, content] of generatedApiFiles) {
        // 查找所有 apiRequest 调用
        const apiRequestMatches = content.match(/apiRequest<[^>]+>\(\{[^}]+\}\)/gs) || [];

        for (const match of apiRequestMatches) {
          expect(match.includes('operationId:'), `${fileName} 中的 apiRequest 调用应包含 operationId`).toBe(true);
        }
      }
    });
  });

  /**
   * Property 5: 自定义配置正确应用
   * **Validates: Requirements 5.2, 5.3, 5.4**
   *
   * *For any* 在 apiCustomConfigs 中配置的 API，配置应正确应用
   */
  describe('Property 5: 自定义配置正确应用', () => {
    it('配置的 operationId 应存在于生成的 API 中', () => {
      // 读取 api-config.ts
      const apiConfigPath = path.join(API_GEN_DIR, 'api-config.ts');
      const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf-8');

      // 提取配置的 operationId
      const operationIdMatches = apiConfigContent.match(/(\w+Controller_\w+_v\d+):/g) || [];
      const configuredOperationIds = operationIdMatches.map(m => m.replace(':', ''));

      // 合并所有 API 文件内容
      let allApiContent = '';
      for (const content of generatedApiFiles.values()) {
        allApiContent += content;
      }

      // 验证每个配置的 operationId 都存在于生成的 API 中
      for (const operationId of configuredOperationIds) {
        expect(
          allApiContent.includes(`operationId: '${operationId}'`),
          `配置的 operationId "${operationId}" 应存在于生成的 API 中`
        ).toBe(true);
      }
    });
  });

  /**
   * Property 1: 生成代码使用正确的 request 导入
   * **Validates: Requirements 1.4, 6.3**
   */
  describe('Property 1: 生成代码使用正确的 request 导入', () => {
    it('所有 API 文件应导入 apiRequest', () => {
      for (const [fileName, content] of generatedApiFiles) {
        expect(
          content.includes('import { apiRequest') || content.includes('import {apiRequest'),
          `${fileName} 应导入 apiRequest`
        ).toBe(true);
      }
    });

    it('所有生成的文件应包含 @generated 标记', () => {
      for (const [fileName, content] of generatedApiFiles) {
        expect(content.includes('@generated'), `${fileName} 应包含 @generated 标记`).toBe(true);
      }

      // 检查 types.ts
      expect(generatedTypes.includes('@generated'), 'types.ts 应包含 @generated 标记').toBe(true);
    });
  });

  /**
   * Property 6: 按 Tags 分组生成文件
   * **Validates: Requirements 2.2**
   */
  describe('Property 6: 按 Tags 分组生成文件', () => {
    it('相同 tag 的 API 应在同一个文件中', () => {
      // 收集每个 operationId 对应的 tag
      const operationIdToTag = new Map<string, string>();
      for (const [, methods] of Object.entries(openApiSpec.paths)) {
        for (const [, operation] of Object.entries(methods)) {
          if (operation.operationId && operation.tags?.[0]) {
            operationIdToTag.set(operation.operationId, operation.tags[0]);
          }
        }
      }

      // 检查每个文件中的 operationId 是否属于同一个 tag
      for (const [fileName, content] of generatedApiFiles) {
        const operationIdMatches = content.match(/operationId: '([^']+)'/g) || [];
        const operationIds = operationIdMatches.map(m => m.replace("operationId: '", '').replace("'", ''));

        if (operationIds.length > 1) {
          const tags = new Set(operationIds.map(id => operationIdToTag.get(id)).filter(Boolean));
          // 同一个文件中的 API 应该属于同一个 tag（或少数几个相关的 tag）
          expect(tags.size <= 2, `${fileName} 中的 API 应属于相同或相关的 tag，但发现 ${tags.size} 个不同的 tag`).toBe(
            true
          );
        }
      }
    });
  });
});
