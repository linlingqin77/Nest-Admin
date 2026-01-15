<script setup lang="tsx">
import { NDivider } from 'naive-ui';
import { fetchNoticeFindAll, fetchNoticeRemove } from '@/service/api-gen';
import type { NoticeResponseDto } from '@/service/api-gen/types';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import DictTag from '@/components/custom/dict-tag.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import NoticeOperateDrawer from './modules/notice-operate-drawer.vue';
import NoticeSearch from './modules/notice-search.vue';

defineOptions({
  name: 'NoticeList',
});

useDict('sys_notice_type');
useDict('sys_normal_disable');
const appStore = useAppStore();
const { hasAuth } = useAuth();
const tableProps = useTableProps();

const {
  columns,
  columnChecks,
  data,
  getData,
  getDataByPage,
  loading,
  mobilePagination,
  searchParams,
  resetSearchParams,
} = useTable({
  apiFn: fetchNoticeFindAll as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    noticeTitle: null,
    noticeType: null,
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
    },
    {
      key: 'noticeTitle',
      title: '公告标题',
      align: 'center',
      width: 300,
    },
    {
      key: 'noticeType',
      title: '公告类型',
      align: 'center',
      minWidth: 120,
      render(row) {
        return <DictTag size="small" value={(row as unknown as NoticeResponseDto).noticeType} dictCode="sys_notice_type" />;
      },
    },
    {
      key: 'status',
      title: '公告状态',
      align: 'center',
      minWidth: 120,
      render(row) {
        return <DictTag size="small" value={(row as unknown as NoticeResponseDto).status} dictCode="sys_normal_disable" />;
      },
    },
    {
      key: 'createBy',
      title: '创建者',
      align: 'center',
      minWidth: 120,
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      minWidth: 120,
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: (row) => {
        const typedRow = row as unknown as NoticeResponseDto;
        const divider = () => {
          if (!hasAuth('system:notice:edit') || !hasAuth('system:notice:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('system:notice:edit')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(typedRow.noticeId!)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('system:notice:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(typedRow.noticeId!)}
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
      },
    },
  ],
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, getData);

async function handleBatchDelete() {
  // request
  try {
    await fetchNoticeRemove(checkedRowKeys.value.join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(noticeId: CommonType.IdType) {
  // request
  try {
    await fetchNoticeRemove(String(noticeId));
    onDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function edit(noticeId: CommonType.IdType) {
  handleEdit('noticeId' as any, noticeId);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NoticeSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="通知公告列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:notice:add')"
          :show-delete="hasAuth('system:notice:remove')"
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
        v-bind="(tableProps as any)"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="(row) => row.noticeId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <NoticeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="(editingData as any)"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
