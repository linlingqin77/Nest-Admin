# 开始开发

本指南将帮助你快速上手 Nest-Admin-Soybean 的开发工作，了解开发流程和最佳实践。

## 开发环境配置

### 1. IDE 推荐

**VS Code** 是推荐的开发工具，安装以下扩展：

#### 必装扩展
- **Vue - Official** - Vue 3 语法支持
- **Prisma** - Prisma ORM 支持
- **ESLint** - 代码检查
- **EditorConfig** - 编辑器配置

#### 推荐扩展
- **UnoCSS** - UnoCSS 智能提示
- **Auto Rename Tag** - 自动重命名标签
- **Path Intellisense** - 路径智能提示
- **GitLens** - Git 增强

### 2. VS Code 配置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 3. 环境变量

#### 后端环境变量

`.env.development`:
```ini
# 环境
NODE_ENV=development

# 端口（通过 config/index.ts 配置）
# PORT=8080

# 数据库配置通过 config/index.ts 管理
```

#### 前端环境变量

`.env.development`:
```ini
# API 地址
VITE_API_BASE_URL=http://localhost:8080/api

# 应用端口
VITE_PORT=9527

# 是否启用加密
VITE_ENABLE_ENCRYPT=true

# 是否启用 Mock
VITE_USE_MOCK=false
```

## 开发流程

### 1. 启动开发服务器

**后端**：
```bash
cd server
pnpm start:dev
```

**前端**：
```bash
cd admin-naive-ui
pnpm dev
```

### 2. 查看 API 文档

访问 `http://localhost:8080/api-docs` 查看 Swagger 文档。

### 3. 热重载

- **后端**: NestJS 监听文件变化自动重启
- **前端**: Vite HMR 即时更新

## 开发一个新功能

以「部门管理」为例，演示完整的开发流程。

### 1. 数据库设计

编辑 `server/prisma/schema.prisma`：

```prisma
model SysDept {
  id        String   @id @default(uuid()) @map("dept_id")
  tenantId  String   @map("tenant_id") @db.VarChar(20)
  parentId  String?  @map("parent_id") @db.VarChar(64)
  deptName  String   @map("dept_name") @db.VarChar(30)
  orderNum  Int      @default(0) @map("order_num")
  leader    String?  @db.VarChar(20)
  phone     String?  @db.VarChar(11)
  email     String?  @db.VarChar(50)
  status    String   @default("0") @db.VarChar(1)
  delFlag   String   @default("0") @map("del_flag") @db.VarChar(1)
  createBy  String   @map("create_by") @db.VarChar(64)
  createTime DateTime @default(now()) @map("create_time")
  updateBy  String   @map("update_by") @db.VarChar(64)
  updateTime DateTime @updatedAt @map("update_time")
  
  @@index([tenantId])
  @@index([parentId])
  @@map("sys_dept")
}
```

运行迁移：
```bash
pnpm prisma:migrate
```

### 2. 后端开发

#### 创建模块

```bash
cd server
nest g module module/system/dept
nest g controller module/system/dept
nest g service module/system/dept
```

#### DTO 定义

`server/src/module/system/dept/dto/create-dept.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateDeptDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  @IsNotEmpty({ message: '部门名称不能为空' })
  @MaxLength(30)
  deptName: string

  @ApiProperty({ description: '父部门ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string

  @ApiProperty({ description: '显示顺序' })
  @IsOptional()
  orderNum?: number

  @ApiProperty({ description: '负责人', required: false })
  @IsOptional()
  @MaxLength(20)
  leader?: string

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @MaxLength(11)
  phone?: string

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @MaxLength(50)
  email?: string

  @ApiProperty({ description: '状态 0=正常 1=停用' })
  @IsOptional()
  status?: string
}
```

`server/src/module/system/dept/dto/update-dept.dto.ts`:

```typescript
import { PartialType } from '@nestjs/swagger'
import { CreateDeptDto } from './create-dept.dto'
import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateDeptDto extends PartialType(CreateDeptDto) {
  @IsString()
  @IsNotEmpty()
  deptId: string
}
```

#### VO 定义

`server/src/module/system/dept/vo/dept.vo.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger'

export class DeptVo {
  @ApiProperty({ description: '部门ID' })
  deptId: string

  @ApiProperty({ description: '租户ID' })
  tenantId: string

  @ApiProperty({ description: '父部门ID' })
  parentId?: string

  @ApiProperty({ description: '部门名称' })
  deptName: string

  @ApiProperty({ description: '显示顺序' })
  orderNum: number

  @ApiProperty({ description: '负责人' })
  leader?: string

  @ApiProperty({ description: '联系电话' })
  phone?: string

  @ApiProperty({ description: '邮箱' })
  email?: string

  @ApiProperty({ description: '状态' })
  status: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date

  @ApiProperty({ description: '子部门', type: [DeptVo] })
  children?: DeptVo[]
}
```

#### Service 实现

`server/src/module/system/dept/dept.service.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/common/prisma/prisma.service'
import { CreateDeptDto, UpdateDeptDto } from './dto'
import { DeptVo } from './vo/dept.vo'

@Injectable()
export class DeptService {
  constructor(private prisma: PrismaService) {}

  // 查询部门列表（树形结构）
  async findAll(): Promise<DeptVo[]> {
    const depts = await this.prisma.sysDept.findMany({
      where: { delFlag: '0' },
      orderBy: { orderNum: 'asc' }
    })

    return this.buildTree(depts)
  }

  // 查询单个部门
  async findOne(id: string): Promise<DeptVo> {
    return this.prisma.sysDept.findUnique({
      where: { id }
    })
  }

  // 创建部门
  async create(createDeptDto: CreateDeptDto, createBy: string): Promise<DeptVo> {
    return this.prisma.sysDept.create({
      data: {
        ...createDeptDto,
        createBy,
        updateBy: createBy
      }
    })
  }

  // 更新部门
  async update(updateDeptDto: UpdateDeptDto, updateBy: string): Promise<DeptVo> {
    const { deptId, ...data } = updateDeptDto

    return this.prisma.sysDept.update({
      where: { id: deptId },
      data: {
        ...data,
        updateBy
      }
    })
  }

  // 删除部门（逻辑删除）
  async remove(id: string, updateBy: string): Promise<void> {
    await this.prisma.sysDept.update({
      where: { id },
      data: {
        delFlag: '1',
        updateBy
      }
    })
  }

  // 构建树形结构
  private buildTree(depts: any[], parentId: string | null = null): DeptVo[] {
    return depts
      .filter(dept => dept.parentId === parentId)
      .map(dept => ({
        ...dept,
        children: this.buildTree(depts, dept.id)
      }))
  }
}
```

#### Controller 实现

`server/src/module/system/dept/dept.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { DeptService } from './dept.service'
import { CreateDeptDto, UpdateDeptDto } from './dto'
import { DeptVo } from './vo/dept.vo'
import { RequirePermission } from '@/common/decorators/permission.decorator'
import { User } from '@/common/decorators/user.decorator'
import { Api } from '@/common/decorators/api.decorator'
import { UserInfo } from '@/common/types'

@ApiTags('部门管理')
@Controller('system/dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get('list')
  @Api({
    summary: '查询部门列表',
    type: [DeptVo]
  })
  @RequirePermission('system:dept:list')
  async list() {
    return this.deptService.findAll()
  }

  @Get(':id')
  @Api({
    summary: '查询部门详情',
    type: DeptVo
  })
  @RequirePermission('system:dept:query')
  async findOne(@Param('id') id: string) {
    return this.deptService.findOne(id)
  }

  @Post()
  @Api({
    summary: '新增部门',
    type: DeptVo,
    body: CreateDeptDto
  })
  @RequirePermission('system:dept:add')
  async create(
    @Body() createDeptDto: CreateDeptDto,
    @User() user: UserInfo
  ) {
    return this.deptService.create(createDeptDto, user.username)
  }

  @Put()
  @Api({
    summary: '修改部门',
    type: DeptVo,
    body: UpdateDeptDto
  })
  @RequirePermission('system:dept:edit')
  async update(
    @Body() updateDeptDto: UpdateDeptDto,
    @User() user: UserInfo
  ) {
    return this.deptService.update(updateDeptDto, user.username)
  }

  @Delete(':id')
  @Api({
    summary: '删除部门'
  })
  @RequirePermission('system:dept:remove')
  async remove(
    @Param('id') id: string,
    @User() user: UserInfo
  ) {
    await this.deptService.remove(id, user.username)
    return { message: '删除成功' }
  }
}
```

### 3. 前端开发

#### API 定义

`admin-naive-ui/src/service/api/system/dept.ts`:

```typescript
import { request } from '@/service/request'

/** 部门 DTO */
export interface DeptDto {
  deptId?: string
  parentId?: string
  deptName: string
  orderNum?: number
  leader?: string
  phone?: string
  email?: string
  status?: string
}

/** 部门 VO */
export interface DeptVo extends DeptDto {
  deptId: string
  tenantId: string
  createTime: string
  children?: DeptVo[]
}

/** 查询部门列表 */
export function fetchDeptList() {
  return request<DeptVo[]>({
    url: '/system/dept/list',
    method: 'GET'
  })
}

/** 查询部门详情 */
export function fetchDeptDetail(id: string) {
  return request<DeptVo>({
    url: `/system/dept/${id}`,
    method: 'GET'
  })
}

/** 新增部门 */
export function addDept(data: DeptDto) {
  return request<DeptVo>({
    url: '/system/dept',
    method: 'POST',
    data
  })
}

/** 修改部门 */
export function updateDept(data: DeptDto) {
  return request<DeptVo>({
    url: '/system/dept',
    method: 'PUT',
    data
  })
}

/** 删除部门 */
export function deleteDept(id: string) {
  return request({
    url: `/system/dept/${id}`,
    method: 'DELETE'
  })
}
```

#### 页面组件

`admin-naive-ui/src/views/system/dept/index.vue`:

```vue
<template>
  <div class="flex-col h-full">
    <!-- 工具栏 -->
    <n-card :bordered="false" class="mb-4">
      <n-space>
        <n-button type="primary" @click="handleAdd">
          <template #icon>
            <icon-ic-round-plus />
          </template>
          新增
        </n-button>
        <n-button @click="handleRefresh">
          <template #icon>
            <icon-mdi-refresh />
          </template>
          刷新
        </n-button>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card :bordered="false" class="flex-1-hidden">
      <n-data-table
        :columns="columns"
        :data="deptList"
        :loading="loading"
        :row-key="row => row.deptId"
        default-expand-all
      />
    </n-card>

    <!-- 编辑对话框 -->
    <dept-modal
      v-model:show="modalVisible"
      :type="modalType"
      :data="editData"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NButton, NSpace, NPopconfirm } from 'naive-ui'
import { fetchDeptList, deleteDept, type DeptVo } from '@/service/api'
import DeptModal from './modules/dept-modal.vue'

const loading = ref(false)
const deptList = ref<DeptVo[]>([])
const modalVisible = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const editData = ref<DeptVo | null>(null)

// 表格列配置
const columns = [
  { key: 'deptName', title: '部门名称', width: 200 },
  { key: 'orderNum', title: '排序', width: 100 },
  { key: 'leader', title: '负责人', width: 120 },
  { key: 'phone', title: '联系电话', width: 150 },
  { key: 'status', title: '状态', width: 100 },
  {
    key: 'actions',
    title: '操作',
    width: 200,
    render: (row: DeptVo) => {
      return h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => handleEdit(row)
            },
            { default: () => '编辑' }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row.deptId)
            },
            {
              trigger: () =>
                h(
                  NButton,
                  { size: 'small', type: 'error' },
                  { default: () => '删除' }
                ),
              default: () => '确定删除该部门吗？'
            }
          )
        ]
      })
    }
  }
]

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const { data } = await fetchDeptList()
    deptList.value = data
  } finally {
    loading.value = false
  }
}

// 新增
function handleAdd() {
  modalType.value = 'add'
  editData.value = null
  modalVisible.value = true
}

// 编辑
function handleEdit(row: DeptVo) {
  modalType.value = 'edit'
  editData.value = row
  modalVisible.value = true
}

// 删除
async function handleDelete(id: string) {
  await deleteDept(id)
  window.$message?.success('删除成功')
  loadData()
}

// 刷新
function handleRefresh() {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>
```

## 常用命令

### 后端命令

```bash
# 启动开发服务器
pnpm start:dev

# 生成 Prisma 客户端
pnpm prisma:generate

# 创建迁移
pnpm prisma:migrate

# 运行种子数据
pnpm prisma:seed

# 查看 Prisma Studio
pnpm prisma:studio

# 运行单元测试
pnpm test

# 运行测试并监听
pnpm test:watch

# 运行测试并生成覆盖率
pnpm test:cov

# 运行 E2E 测试
pnpm test:e2e

# 运行集成测试
pnpm test:integration

# 运行所有测试
pnpm test:all

# 构建生产版本
pnpm build:prod
```

### 前端命令

```bash
# 启动开发服务器
pnpm dev

# 生成路由
pnpm gen-route

# 生成 API 类型
pnpm gen:api

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 运行单元测试
pnpm test

# 运行测试并监听
pnpm test:watch

# 运行测试并生成覆盖率
pnpm test:cov

# 可视化测试界面
pnpm test:ui

# 打开 Cypress 交互界面
pnpm cypress:open

# 运行 Cypress E2E 测试
pnpm cypress:run

# 运行所有测试
pnpm test:all

# 构建生产版本
pnpm build
```

## 调试技巧

### 1. VS Code 调试配置

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach NestJS",
      "port": 9229,
      "restart": true,
      "stopOnEntry": false
    }
  ]
}
```

启动调试：
```bash
pnpm start:debug
```

### 2. Chrome DevTools

前端调试直接使用 Chrome DevTools：
- 按 F12 打开开发者工具
- Sources 标签页设置断点
- Console 查看日志

### 3. Prisma Studio

可视化查看和编辑数据库：

```bash
pnpm prisma:studio
```

访问 `http://localhost:5555`

## 下一步

- [数据库开发](/development/database) - 学习 Prisma 开发
- [API 开发](/development/api) - 深入 API 开发
- [前端架构](/development/frontend-architecture) - 了解前端架构
- [后端架构](/development/backend-architecture) - 了解后端架构
