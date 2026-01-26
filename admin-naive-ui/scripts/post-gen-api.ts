/**
 * OpenAPI 代码生成后处理脚本
 *
 * 功能：
 * 1. 修改生成的文件，替换 client 导入为 request-adapter
 * 2. 应用自定义配置到对应的 API 函数
 * 3. 添加 @generated 注释标记
 * 4. 生成 index.ts 统一导出文件
 * 5. 按 tags 分组生成 API 文件
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const API_GEN_DIR = path.resolve(__dirname, '../src/service/api-gen');
const SERVICE_DIR = path.resolve(__dirname, '../src/service');
const TYPES_GEN_DIR = path.resolve(__dirname, '../src/typings/api-gen');
const OPENAPI_PATH = path.resolve(__dirname, '../../server/public/openApi.json');

// 生成文件头部注释
const GENERATED_HEADER = `/**
 * @generated
 * 此文件由 openapi-ts 自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 * 如需修改 API 配置，请编辑 api-config.ts
 */

`;

interface OpenAPISpec {
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: {
      'application/json'?: {
        schema?: { $ref?: string };
      };
    };
  };
  responses?: Record<string, OpenAPIResponse>;
}

interface OpenAPIParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required?: boolean;
  schema?: { type?: string };
}

interface OpenAPIResponse {
  content?: {
    'application/json'?: {
      schema?: {
        allOf?: Array<{ $ref?: string; properties?: Record<string, unknown> }>;
        $ref?: string;
      };
    };
  };
}

interface ApiInfo {
  operationId: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  tag: string;
  hasPathParams: boolean;
  hasQueryParams: boolean;
  hasBody: boolean;
  pathParams: string[];
  queryParams: string[];
  requestBodyRef?: string;
  responseDataRef?: string;
}

/**
 * 读取 OpenAPI 规范文件
 */
function readOpenAPISpec(): OpenAPISpec {
  const content = fs.readFileSync(OPENAPI_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * 解析 OpenAPI 规范，提取 API 信息
 */
function parseOpenAPISpec(spec: OpenAPISpec): ApiInfo[] {
  const apis: ApiInfo[] = [];

  for (const [pathUrl, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation.operationId) continue;

      const pathParams: string[] = [];
      const queryParams: string[] = [];

      // 解析参数
      if (operation.parameters) {
        for (const param of operation.parameters) {
          if (param.in === 'path') {
            pathParams.push(param.name);
          } else if (param.in === 'query') {
            queryParams.push(param.name);
          }
        }
      }

      // 解析请求体
      let requestBodyRef: string | undefined;
      if (operation.requestBody?.content?.['application/json']?.schema?.$ref) {
        requestBodyRef = operation.requestBody.content['application/json'].schema.$ref.replace(
          '#/components/schemas/',
          ''
        );
      }

      // 解析响应数据类型
      let responseDataRef: string | undefined;
      const response200 = operation.responses?.['200'];
      if (response200?.content?.['application/json']?.schema) {
        const schema = response200.content['application/json'].schema;
        if (schema.allOf) {
          // 查找 data 属性的类型
          for (const item of schema.allOf) {
            if (item.properties?.data) {
              const dataSchema = item.properties.data as { $ref?: string; type?: string; items?: { $ref?: string } };
              if (dataSchema.$ref) {
                responseDataRef = dataSchema.$ref.replace('#/components/schemas/', '');
              } else if (dataSchema.type === 'array' && dataSchema.items?.$ref) {
                responseDataRef = `${dataSchema.items.$ref.replace('#/components/schemas/', '')}[]`;
              }
            }
          }
        } else if (schema.$ref) {
          responseDataRef = schema.$ref.replace('#/components/schemas/', '');
        }
      }

      apis.push({
        operationId: operation.operationId,
        method: method.toUpperCase(),
        path: pathUrl.replace('/api/v1', ''), // 移除 API 前缀
        summary: operation.summary || '',
        description: operation.description || '',
        tag: operation.tags?.[0] || 'default',
        hasPathParams: pathParams.length > 0,
        hasQueryParams: queryParams.length > 0,
        hasBody: Boolean(requestBodyRef),
        pathParams,
        queryParams,
        requestBodyRef,
        responseDataRef
      });
    }
  }

  return apis;
}

/**
 * 将 tag 转换为文件名
 */
function tagToFileName(tag: string): string {
  // 直接转换，不使用映射表
  // 将中文转换为拼音或英文等，这里使用简单的规则
  return (
    tag
      .toLowerCase()
      .replace(/[\s\/]+/g, '-')
      .replace(/[^a-z0-9-\u4e00-\u9fff]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'default'
  );
}

/**
 * 将 operationId 转换为函数名
 */
function operationIdToFunctionName(operationId: string): string {
  // 移除 Controller 和 _v1 后缀
  const name = operationId.replace(/Controller_/g, '_').replace(/_v\d+$/, '');

  // 转换为 camelCase
  const parts = name.split('_');
  return `fetch${parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}`;
}

/**
 * 生成单个 API 函数代码
 */
function generateApiFunction(api: ApiInfo): string {
  const funcName = operationIdToFunctionName(api.operationId);
  const lines: string[] = [];

  // JSDoc 注释
  lines.push('/**');
  if (api.summary) {
    lines.push(` * ${api.summary}`);
  }
  if (api.description && api.description !== api.summary) {
    lines.push(` * @description ${api.description}`);
  }
  lines.push(' */');

  // 函数参数
  const params: string[] = [];
  const paramTypes: string[] = [];

  if (api.hasPathParams) {
    for (const param of api.pathParams) {
      params.push(param);
      paramTypes.push(`${param}: string | number`);
    }
  }

  if (api.hasBody && api.requestBodyRef) {
    params.push('data');
    paramTypes.push(`data: ${api.requestBodyRef}`);
  }

  if (api.hasQueryParams) {
    params.push('params');
    paramTypes.push(`params?: Record<string, unknown>`);
  }

  // 返回类型
  const returnType = api.responseDataRef || 'unknown';

  // 函数签名
  const paramsStr = paramTypes.join(', ');
  lines.push(`export function ${funcName}(${paramsStr}) {`);

  // URL 处理
  let urlExpr = `'${api.path}'`;
  if (api.hasPathParams) {
    urlExpr = `buildUrl('${api.path}', { ${api.pathParams.join(', ')} })`;
  }

  // 请求配置
  lines.push(`  return apiRequest<${returnType}>({`);
  lines.push(`    method: '${api.method}',`);
  lines.push(`    url: ${urlExpr},`);
  if (api.hasBody) {
    lines.push(`    data,`);
  }
  if (api.hasQueryParams) {
    lines.push(`    params,`);
  }
  lines.push(`    operationId: '${api.operationId}',`);
  lines.push(`  });`);
  lines.push(`}`);

  return lines.join('\n');
}

/**
 * 生成统一的 API 文件（不按 tag 分组）
 */
function generateApiFiles(apis: ApiInfo[]): void {
  // 确保目录存在
  if (!fs.existsSync(API_GEN_DIR)) {
    fs.mkdirSync(API_GEN_DIR, { recursive: true });
  }

  // 收集需要导入的类型
  const importTypes = new Set<string>();
  for (const api of apis) {
    if (api.requestBodyRef) {
      importTypes.add(api.requestBodyRef);
    }
    if (api.responseDataRef) {
      // 处理数组类型
      const baseType = api.responseDataRef.replace('[]', '');
      importTypes.add(baseType);
    }
  }

  // 生成文件内容
  const lines: string[] = [GENERATED_HEADER];

  // 导入语句 - request-adapter 在 service 目录下
  lines.push(`import { apiRequest, buildUrl } from '../request-adapter';`);
  if (importTypes.size > 0) {
    lines.push(`import type { ${Array.from(importTypes).join(', ')} } from './types';`);
  }
  lines.push('');

  // API 函数
  for (const api of apis) {
    lines.push(generateApiFunction(api));
    lines.push('');
  }

  // 写入统一的 API 文件
  const apiPath = path.join(API_GEN_DIR, 'api.ts');
  fs.writeFileSync(apiPath, lines.join('\n'));
  console.log(`Generated: api.ts (${apis.length} APIs)`);

  // 生成 index.ts
  generateIndexFile();
}

/**
 * 生成 index.ts 统一导出文件
 */
function generateIndexFile(): void {
  const lines: string[] = [GENERATED_HEADER];

  lines.push(`// 导出请求适配器`);
  lines.push(`export * from '../request-adapter';`);
  lines.push(`export * from '../api-config';`);
  lines.push('');

  lines.push(`// 导出所有 API`);
  lines.push(`export * from './api';`);

  const indexPath = path.join(API_GEN_DIR, 'index.ts');
  fs.writeFileSync(indexPath, lines.join('\n'));
  console.log('Generated: index.ts');
}

/**
 * 生成类型定义文件
 */
function generateTypesFile(spec: OpenAPISpec): void {
  // 确保目录存在
  if (!fs.existsSync(API_GEN_DIR)) {
    fs.mkdirSync(API_GEN_DIR, { recursive: true });
  }
  if (!fs.existsSync(TYPES_GEN_DIR)) {
    fs.mkdirSync(TYPES_GEN_DIR, { recursive: true });
  }

  const schemas = spec.components?.schemas || {};
  const lines: string[] = [GENERATED_HEADER];

  lines.push(`// OpenAPI Schema 类型定义`);
  lines.push('');

  // 生成每个 schema 的类型
  for (const [name, schema] of Object.entries(schemas)) {
    lines.push(generateTypeDefinition(name, schema as Record<string, unknown>));
    lines.push('');
  }

  // 写入 types.ts
  const typesPath = path.join(API_GEN_DIR, 'types.ts');
  fs.writeFileSync(typesPath, lines.join('\n'));
  console.log(`Generated: types.ts (${Object.keys(schemas).length} schemas)`);

  // 同时在 typings/api-gen 目录生成
  const typingsPath = path.join(TYPES_GEN_DIR, 'index.ts');
  fs.writeFileSync(typingsPath, lines.join('\n'));
  console.log(`Generated: typings/api-gen/index.ts`);
}

/**
 * 生成单个类型定义
 */
function generateTypeDefinition(name: string, schema: Record<string, unknown>): string {
  const lines: string[] = [];

  // 处理描述
  if (schema.description) {
    lines.push(`/** ${schema.description} */`);
  }

  // 处理枚举
  if (schema.enum) {
    const enumValues = (schema.enum as string[]).map(v => (typeof v === 'string' ? `'${v}'` : v)).join(' | ');
    lines.push(`export type ${name} = ${enumValues};`);
    return lines.join('\n');
  }

  // 处理对象类型
  if (schema.type === 'object' || schema.properties) {
    lines.push(`export interface ${name} {`);

    const properties = (schema.properties as Record<string, Record<string, unknown>>) || {};
    const required = (schema.required as string[]) || [];

    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = required.includes(propName);
      const propType = schemaToType(propSchema);
      const optional = isRequired ? '' : '?';

      if (propSchema.description) {
        lines.push(`  /** ${propSchema.description} */`);
      }
      lines.push(`  ${propName}${optional}: ${propType};`);
    }

    lines.push(`}`);
    return lines.join('\n');
  }

  // 其他类型
  const type = schemaToType(schema);
  lines.push(`export type ${name} = ${type};`);
  return lines.join('\n');
}

/**
 * 将 OpenAPI schema 转换为 TypeScript 类型
 */
function schemaToType(schema: Record<string, unknown>): string {
  if (schema.$ref) {
    return (schema.$ref as string).replace('#/components/schemas/', '');
  }

  if (schema.allOf) {
    const types = (schema.allOf as Record<string, unknown>[]).map(s => schemaToType(s));
    return types.join(' & ');
  }

  if (schema.oneOf) {
    const types = (schema.oneOf as Record<string, unknown>[]).map(s => schemaToType(s));
    return types.join(' | ');
  }

  if (schema.anyOf) {
    const types = (schema.anyOf as Record<string, unknown>[]).map(s => schemaToType(s));
    return types.join(' | ');
  }

  const type = schema.type as string;

  switch (type) {
    case 'string':
      if (schema.enum) {
        return (schema.enum as string[]).map(v => `'${v}'`).join(' | ');
      }
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      const items = schema.items as Record<string, unknown>;
      return `${schemaToType(items)}[]`;
    case 'object':
      if (schema.additionalProperties) {
        const valueType = schemaToType(schema.additionalProperties as Record<string, unknown>);
        return `Record<string, ${valueType}>`;
      }
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('🚀 开始处理 OpenAPI 代码生成...\n');

  try {
    // 读取 OpenAPI 规范
    console.log('📖 读取 OpenAPI 规范文件...');
    const spec = readOpenAPISpec();

    // 解析 API 信息
    console.log('🔍 解析 API 信息...');
    const apis = parseOpenAPISpec(spec);
    console.log(`   找到 ${apis.length} 个 API 端点\n`);

    // 生成类型定义
    console.log('📝 生成类型定义...');
    generateTypesFile(spec);

    // 生成 API 文件
    console.log('\n📝 生成 API 文件...');
    generateApiFiles(apis);

    console.log('\n✅ 代码生成完成！');
  } catch (error) {
    console.error('❌ 代码生成失败:', error);
    process.exit(1);
  }
}

main();
