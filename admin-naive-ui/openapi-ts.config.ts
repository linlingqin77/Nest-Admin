import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // 输入源：后端生成的 OpenAPI 规范文件
  input: '../server/public/openApi.json',

  // 输出配置
  output: {
    // API 服务文件输出目录
    path: 'src/service/api-gen',
    // 使用 prettier 格式化输出
    format: 'prettier',
    // 生成 ESM 模块
    lint: 'eslint',
  },

  // 插件配置
  plugins: [
    // TypeScript 类型生成插件
    {
      name: '@hey-api/typescript',
      // 生成枚举类型
      enums: 'javascript',
      // 导出所有类型
      exportInlineEnums: true,
    },
    // SDK/服务生成插件
    {
      name: '@hey-api/sdk',
      // 生成函数而非类
      asClass: false,
      // 使用 operationId 作为函数名
      operationId: true,
    },
  ],

  // 不使用内置 client，我们将使用自定义的 request-adapter
  client: false,
});
