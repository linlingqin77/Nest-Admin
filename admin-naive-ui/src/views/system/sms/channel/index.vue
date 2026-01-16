<script setup lang="tsx">
import { NDivider } from 'naive-ui';
import { fetchSmsChannelFindAll, fetchSmsChannelRemove } from '@/service/api-gen';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import DictTag from '@/components/custom/dict-tag.vue';
import ButtonIcon from '@/components/custom/button-icon.vue';
import ChannelOperateDrawer from './modules/channel-operate-drawer.vue';
import ChannelSearch from './modules/channel-search.vue';

defineOptions({
  name: 'SmsChannelList'
});

useDict('sys_normal_disable');
const appStore = useAppStore();
const { hasAuth } = useAuth();
const tableProps = useTableProps();

const channelCodeMap: Record<string, string> = {
  aliyun: '阿里云',
  tencent: '腾讯云',
  huawei: '华为云',
  qiniu: '七牛云',
  yunpian: '云片'
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
  apiFn: fetchSmsChannelFindAll as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    code: null,
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
      title: '渠道名称',
      align: 'center',
      minWidth: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'code',
      title: '渠道编码',
      align: 'center',
      minWidth: 100,
      render(row) {
        const typedRow = row as unknown as Api.System.SmsChannel;
        return channelCodeMap[typedRow.code] || typedRow.code;
      }
    },
    {
      key: 'signature',
      title: '短信签名',
      align: 'center',
      minWidth: 100,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'apiKey',
      title: 'API Key',
      align: 'center',
      minWidth: 120,
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
        const typedRow = row as unknown as Api.System.SmsChannel;
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
        const typedRow = row as unknown as Api.System.SmsChannel;
        const divider = () => {
          if (!hasAuth('system:sms:channel:edit') || !hasAuth('system:sms:channel:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('system:sms:channel:edit')) {
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
          if (!hasAuth('system:sms:channel:remove')) {
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
    await fetchSmsChannelRemove(checkedRowKeys.value.join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(id: CommonType.IdType) {
  try {
    await fetchSmsChannelRemove(id);
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
    <ChannelSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="短信渠道列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:sms:channel:add')"
          :show-delete="hasAuth('system:sms:channel:remove')"
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
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <ChannelOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="(editingData as any)"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
