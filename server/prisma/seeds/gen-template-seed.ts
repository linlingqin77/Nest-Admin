/**
 * 代码生成器模板种子数据
 *
 * 包含默认模板组和 NestJS、Vue3 模板
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NestJS Controller 模板
const nestjsControllerTemplate = `import { Controller, Get, Post, Put, Delete, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RequirePermission } from '@/core/decorators';
import { \${className}Service } from './\${businessName}.service';
import { Create\${className}Dto, Update\${className}Dto, List\${className}Dto } from './dto';

@ApiTags('\${functionName}')
@Controller('\${moduleName}/\${businessName}')
@ApiBearerAuth('Authorization')
export class \${className}Controller {
  constructor(private readonly \${businessName}Service: \${className}Service) {}

  @Get()
  @ApiOperation({ summary: '获取\${functionName}列表' })
  @RequirePermission('\${moduleName}:\${businessName}:list')
  async list(@Query() query: List\${className}Dto) {
    return this.\${businessName}Service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取\${functionName}详情' })
  @RequirePermission('\${moduleName}:\${businessName}:query')
  async getById(@Param('id') id: number) {
    return this.\${businessName}Service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建\${functionName}' })
  @RequirePermission('\${moduleName}:\${businessName}:add')
  async create(@Body() dto: Create\${className}Dto) {
    return this.\${businessName}Service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新\${functionName}' })
  @RequirePermission('\${moduleName}:\${businessName}:edit')
  async update(@Param('id') id: number, @Body() dto: Update\${className}Dto) {
    return this.\${businessName}Service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除\${functionName}' })
  @RequirePermission('\${moduleName}:\${businessName}:remove')
  async delete(@Param('id') id: number) {
    return this.\${businessName}Service.delete(id);
  }
}
`;

// NestJS Service 模板
const nestjsServiceTemplate = `import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma';
import { Result, ResponseCode } from '@/shared/response';
import { Create\${className}Dto, Update\${className}Dto, List\${className}Dto } from './dto';

@Injectable()
export class \${className}Service {
  private readonly logger = new Logger(\${className}Service.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取分页列表
   */
  async findAll(query: List\${className}Dto) {
    const { skip, take, pageNum, pageSize } = query.toPaginationParams();
    const where = this.buildWhereCondition(query);

    const [rows, total] = await Promise.all([
      this.prisma.\${tableName}.findMany({
        where,
        skip,
        take,
        orderBy: query.getOrderBy('createTime'),
      }),
      this.prisma.\${tableName}.count({ where }),
    ]);

    return Result.page(rows, total, pageNum, pageSize);
  }

  /**
   * 根据 ID 获取详情
   */
  async findById(id: number) {
    const data = await this.prisma.\${tableName}.findUnique({
      where: { \${primaryKey}: id },
    });

    if (!data) {
      return Result.fail(ResponseCode.DATA_NOT_FOUND, '数据不存在');
    }

    return Result.ok(data);
  }

  /**
   * 创建
   */
  async create(dto: Create\${className}Dto) {
    try {
      const data = await this.prisma.\${tableName}.create({
        data: dto,
      });
      return Result.ok(data, '创建成功');
    } catch (error) {
      this.logger.error('创建失败', error);
      return Result.fail(ResponseCode.OPERATION_FAILED, '创建失败');
    }
  }

  /**
   * 更新
   */
  async update(id: number, dto: Update\${className}Dto) {
    const exists = await this.prisma.\${tableName}.findUnique({
      where: { \${primaryKey}: id },
    });
    if (!exists) {
      return Result.fail(ResponseCode.DATA_NOT_FOUND, '数据不存在');
    }

    const data = await this.prisma.\${tableName}.update({
      where: { \${primaryKey}: id },
      data: dto,
    });

    return Result.ok(data, '更新成功');
  }

  /**
   * 删除
   */
  async delete(id: number) {
    const exists = await this.prisma.\${tableName}.findUnique({
      where: { \${primaryKey}: id },
    });
    if (!exists) {
      return Result.fail(ResponseCode.DATA_NOT_FOUND, '数据不存在');
    }

    await this.prisma.\${tableName}.delete({ where: { \${primaryKey}: id } });
    return Result.ok(null, '删除成功');
  }

  /**
   * 构建查询条件
   */
  private buildWhereCondition(query: List\${className}Dto) {
    const where: any = { delFlag: '0' };
    // TODO: 根据字段配置生成查询条件
    return where;
  }
}
`;

// NestJS Module 模板
const nestjsModuleTemplate = `import { Module } from '@nestjs/common';
import { \${className}Controller } from './\${businessName}.controller';
import { \${className}Service } from './\${businessName}.service';

@Module({
  controllers: [\${className}Controller],
  providers: [\${className}Service],
  exports: [\${className}Service],
})
export class \${className}Module {}
`;

// NestJS DTO 模板
const nestjsDtoTemplate = `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PageQueryDto } from '@/shared/dto';

/**
 * 列表查询 DTO
 */
export class List\${className}Dto extends PageQueryDto {
  // TODO: 根据字段配置生成查询参数
}

/**
 * 创建 DTO
 */
export class Create\${className}Dto {
  // TODO: 根据字段配置生成创建参数
}

/**
 * 更新 DTO
 */
export class Update\${className}Dto {
  // TODO: 根据字段配置生成更新参数
}
`;

// Vue3 Index 页面模板
const vue3IndexTemplate = `<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { NButton, NSpace, NPopconfirm, useMessage } from 'naive-ui';
import { useTable, useTableOperate } from '@/hooks/common';
import { useAuth } from '@/hooks/business';
import { fetch\${className}List, delete\${className} } from '@/service/api';
import \${className}Dialog from './dialog.vue';

defineOptions({ name: '\${className}Management' });

const message = useMessage();
const { hasPermission } = useAuth();

const {
  loading,
  data,
  pagination,
  handlePageChange,
  handlePageSizeChange,
  refresh,
} = useTable(fetch\${className}List);

const {
  dialogVisible,
  dialogTitle,
  dialogLoading,
  editingId,
  openCreateDialog,
  openEditDialog,
  closeDialog,
} = useTableOperate();

const searchParams = reactive({
  // TODO: 根据字段配置生成搜索参数
});

async function handleDelete(id: number) {
  try {
    await delete\${className}(id);
    message.success('删除成功');
    refresh();
  } catch (error) {
    message.error('删除失败');
  }
}

function handleSearch() {
  refresh();
}

function handleReset() {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined;
  });
  refresh();
}

function handleSuccess() {
  closeDialog();
  refresh();
}

onMounted(() => {
  refresh();
});
</script>

<template>
  <div class="h-full flex-col">
    <!-- 搜索区域 -->
    <n-card class="mb-4" size="small">
      <n-form inline label-placement="left" :model="searchParams">
        <!-- TODO: 根据字段配置生成搜索表单 -->
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSearch">搜索</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>

    <!-- 操作按钮 -->
    <n-card class="mb-4" size="small">
      <n-space>
        <n-button
          v-if="hasPermission('\${moduleName}:\${businessName}:add')"
          type="primary"
          @click="openCreateDialog"
        >
          新增
        </n-button>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="flex-1" size="small">
      <n-data-table
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- 编辑弹窗 -->
    <\${className}Dialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :loading="dialogLoading"
      :id="editingId"
      @success="handleSuccess"
    />
  </div>
</template>
`;

// Vue3 Dialog 组件模板
const vue3DialogTemplate = `<script setup lang="ts">
import { ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { fetch\${className}Detail, create\${className}, update\${className} } from '@/service/api';

interface Props {
  visible: boolean;
  title: string;
  loading?: boolean;
  id?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  id: null,
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const formData = ref({
  // TODO: 根据字段配置生成表单数据
});

const rules: FormRules = {
  // TODO: 根据字段配置生成验证规则
};

watch(
  () => props.visible,
  async (val) => {
    if (val && props.id) {
      const { data } = await fetch\${className}Detail(props.id);
      Object.assign(formData.value, data);
    } else {
      resetForm();
    }
  }
);

function resetForm() {
  formData.value = {
    // TODO: 重置表单数据
  };
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    submitting.value = true;

    if (props.id) {
      await update\${className}(props.id, formData.value);
      message.success('更新成功');
    } else {
      await create\${className}(formData.value);
      message.success('创建成功');
    }

    emit('success');
  } catch (error) {
    // 验证失败或请求失败
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  emit('update:visible', false);
}
</script>

<template>
  <n-modal
    :show="visible"
    :title="title"
    preset="dialog"
    style="width: 600px"
    @update:show="handleClose"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="100"
    >
      <!-- TODO: 根据字段配置生成表单项 -->
    </n-form>

    <template #action>
      <n-space>
        <n-button @click="handleClose">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
`;

// Vue3 API 模板
const vue3ApiTemplate = `import { request } from '@/service/request';
import type { \${className}Info, \${className}ListParams, \${className}ListResult } from '@/typings/api';

/**
 * 获取\${functionName}列表
 */
export function fetch\${className}List(params: \${className}ListParams) {
  return request.get<\${className}ListResult>('/\${moduleName}/\${businessName}/list', { params });
}

/**
 * 获取\${functionName}详情
 */
export function fetch\${className}Detail(id: number) {
  return request.get<\${className}Info>(\`/\${moduleName}/\${businessName}/\${id}\`);
}

/**
 * 创建\${functionName}
 */
export function create\${className}(data: Partial<\${className}Info>) {
  return request.post<\${className}Info>('/\${moduleName}/\${businessName}', data);
}

/**
 * 更新\${functionName}
 */
export function update\${className}(id: number, data: Partial<\${className}Info>) {
  return request.put<\${className}Info>(\`/\${moduleName}/\${businessName}/\${id}\`, data);
}

/**
 * 删除\${functionName}
 */
export function delete\${className}(id: number) {
  return request.delete(\`/\${moduleName}/\${businessName}/\${id}\`);
}
`;

// 菜单 SQL 模板
const menuSqlTemplate = `-- \${functionName}菜单
INSERT INTO sys_menu (tenant_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark, del_flag)
VALUES ('000000', '\${functionName}', @parentId, 1, '\${businessName}', '\${moduleName}/\${businessName}/index', '', '1', '0', 'C', '0', '0', '\${moduleName}:\${businessName}:list', 'list', 'admin', NOW(), '', NOW(), '\${functionName}菜单', '0');

SET @menuId = LAST_INSERT_ID();

-- 按钮权限
INSERT INTO sys_menu (tenant_id, menu_name, parent_id, order_num, path, component, query, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark, del_flag)
VALUES 
('000000', '查询', @menuId, 1, '', '', '', '1', '0', 'F', '0', '0', '\${moduleName}:\${businessName}:query', '', 'admin', NOW(), '', NOW(), '', '0'),
('000000', '新增', @menuId, 2, '', '', '', '1', '0', 'F', '0', '0', '\${moduleName}:\${businessName}:add', '', 'admin', NOW(), '', NOW(), '', '0'),
('000000', '修改', @menuId, 3, '', '', '', '1', '0', 'F', '0', '0', '\${moduleName}:\${businessName}:edit', '', 'admin', NOW(), '', NOW(), '', '0'),
('000000', '删除', @menuId, 4, '', '', '', '1', '0', 'F', '0', '0', '\${moduleName}:\${businessName}:remove', '', 'admin', NOW(), '', NOW(), '', '0'),
('000000', '导出', @menuId, 5, '', '', '', '1', '0', 'F', '0', '0', '\${moduleName}:\${businessName}:export', '', 'admin', NOW(), '', NOW(), '', '0');
`;

export async function seedGenTemplates() {
  console.log('开始导入代码生成器模板种子数据...');

  // 创建默认模板组（系统级，tenantId 为 null）
  const templateGroup = await prisma.genTemplateGroup.upsert({
    where: {
      tenantId_name: {
        tenantId: null,
        name: '默认模板组',
      },
    },
    update: {},
    create: {
      tenantId: null,
      name: '默认模板组',
      description: '系统默认模板组，包含 NestJS 和 Vue3 模板',
      isDefault: true,
      status: '0',
      delFlag: '0',
      createBy: 'system',
    },
  });

  console.log(`创建模板组: ${templateGroup.name} (ID: ${templateGroup.id})`);

  // 创建 NestJS 模板
  const nestjsTemplates = [
    {
      groupId: templateGroup.id,
      name: 'NestJS Controller',
      fileName: '${businessName}.controller.ts',
      filePath: 'server/src/module/${moduleName}/${businessName}',
      content: nestjsControllerTemplate,
      language: 'typescript',
      sort: 1,
    },
    {
      groupId: templateGroup.id,
      name: 'NestJS Service',
      fileName: '${businessName}.service.ts',
      filePath: 'server/src/module/${moduleName}/${businessName}',
      content: nestjsServiceTemplate,
      language: 'typescript',
      sort: 2,
    },
    {
      groupId: templateGroup.id,
      name: 'NestJS Module',
      fileName: '${businessName}.module.ts',
      filePath: 'server/src/module/${moduleName}/${businessName}',
      content: nestjsModuleTemplate,
      language: 'typescript',
      sort: 3,
    },
    {
      groupId: templateGroup.id,
      name: 'NestJS DTO',
      fileName: 'dto/index.ts',
      filePath: 'server/src/module/${moduleName}/${businessName}',
      content: nestjsDtoTemplate,
      language: 'typescript',
      sort: 4,
    },
  ];

  // 创建 Vue3 模板
  const vue3Templates = [
    {
      groupId: templateGroup.id,
      name: 'Vue3 Index Page',
      fileName: 'index.vue',
      filePath: 'admin-naive-ui/src/views/${moduleName}/${businessName}',
      content: vue3IndexTemplate,
      language: 'vue',
      sort: 10,
    },
    {
      groupId: templateGroup.id,
      name: 'Vue3 Dialog Component',
      fileName: 'dialog.vue',
      filePath: 'admin-naive-ui/src/views/${moduleName}/${businessName}',
      content: vue3DialogTemplate,
      language: 'vue',
      sort: 11,
    },
    {
      groupId: templateGroup.id,
      name: 'Vue3 API Service',
      fileName: '${businessName}.ts',
      filePath: 'admin-naive-ui/src/service/api/${moduleName}',
      content: vue3ApiTemplate,
      language: 'typescript',
      sort: 12,
    },
  ];

  // 创建 SQL 模板
  const sqlTemplates = [
    {
      groupId: templateGroup.id,
      name: 'Menu SQL',
      fileName: '${businessName}_menu.sql',
      filePath: 'sql',
      content: menuSqlTemplate,
      language: 'sql',
      sort: 20,
    },
  ];

  const allTemplates = [...nestjsTemplates, ...vue3Templates, ...sqlTemplates];

  for (const template of allTemplates) {
    await prisma.genTemplate.upsert({
      where: {
        id: 0, // 使用不存在的 ID 强制创建
      },
      update: {},
      create: {
        ...template,
        status: '0',
        delFlag: '0',
        createBy: 'system',
      },
    });
    console.log(`创建模板: ${template.name}`);
  }

  // 使用 createMany 批量创建（跳过重复）
  await prisma.genTemplate.createMany({
    data: allTemplates.map((t) => ({
      ...t,
      status: '0',
      delFlag: '0',
      createBy: 'system',
    })),
    skipDuplicates: true,
  });

  console.log('代码生成器模板种子数据导入完成!');
}

// 如果直接运行此文件
if (require.main === module) {
  seedGenTemplates()
    .catch((e) => {
      console.error('种子数据导入失败:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
