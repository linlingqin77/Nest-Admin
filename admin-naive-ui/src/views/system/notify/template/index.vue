<script setup lang="tsx">
import { NDivider, NTag } from 'naive-ui';
import { fetchNotifyTemplateFindAll, fetchNotifyTemplateRemove } from '@/service/api-gen';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import DictTag from '@/components/custom/dict-tag.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import TemplateOperateDrawer from './modules/template-operate-drawer.vue';
import TemplateSearch from './modules/template-search.vue';

defineOptions({
  name: 'NotifyTemplateList'
});

useDict('sys_normal_disable');
const appStore = useAppStore();
const { hasAuth } = useAuth();
const tableProps = useTableProps();

const templateTypeMap: Record<number, { label: string; type: NaiveUI.ThemeColor }> = {
  1: { label: '系统通知', type: 'info' },
  2: { label: '业务通知', type: 'success' }
};

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchNotifyTemplateFindAll as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    code: null,
    type: null,
    status: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: 'ID',
      align: 'center',
      width: 60
    },
    {
      key: 'name',
      title: '模板名称',
      align: 'center',
      minWidth: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'code',
      title: '模板编码',
      align: 'center',
      minWidth: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'nickname',
      title: '发送人',
      align: 'center',
      minWidth: 100
    },
    {
      key: 'type',
      title: '模板类型',
      align: 'center',
      minWidth: 100,
      render(row) {
        const typedRow = row as unknown as Api.System.NotifyTemplate;
        const typeInfo = templateTypeMap[typedRow.type] || { label: '未知', type: 'default' };
        return (
          <NTag size="small" type={typeInfo.type}>
            {typeInfo.label}
          </NTag>
        );
      }
    },
    {
      key: 'content',
      title: '模板内容',
      align: 'center',
      minWidth: 200,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      minWidth: 80,
      render(row) {
        const typedRow = row as unknown as Api.System.NotifyTemplate;
        return <DictTag size="small" value={typedRow.status} dictCode="sys_normal_disable" />;
      }
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      minWidth: 160
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => {
        const typedRow = row as unknown as Api.System.NotifyTemplate;
        const divider = () => {
          if (!hasAuth('system:notify:template:edit') || !hasAuth('system:notify:template:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('system:notify:template:edit')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(typedRow.id!)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('system:notify:template:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(typedRow.id!)}
            />
          );
        };

        return (
          <div class="flex-center gap-8px">
            {editBtn()}
            {divider()}
            {deleteBtn()}
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, getData);

async function handleBatchDelete() {
  try {
    await fetchNotifyTemplateRemove(checkedRowKeys.value.join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(id: CommonType.IdType) {
  try {
    await fetchNotifyTemplateRemove(id);
    onDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function edit(id: CommonType.IdType) {
  handleEdit('id' as any, id);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TemplateSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="站内信模板列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:notify:template:add')"
          :show-delete="hasAuth('system:notify:template:remove')"
          :show-export="false"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        v-bind="tableProps"
        :flex-height="!appStore.isMobile"
        :scroll-x="1000"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <TemplateOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="(editingData as any)"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
