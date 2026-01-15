<script setup lang="tsx">
import { ref } from 'vue';
import { NDivider, NTag } from 'naive-ui';
import { fetchNotifyMessageFindAll, fetchNotifyMessageRemoveBatch } from '@/service/api-gen';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import MessageSearch from './modules/message-search.vue';
import MessageSendDrawer from './modules/message-send-drawer.vue';
import MessageDetailModal from './modules/message-detail-modal.vue';

defineOptions({
  name: 'NotifyMessageList',
});

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
  apiFn: fetchNotifyMessageFindAll as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    templateCode: null,
    readStatus: null,
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
    },
    {
      key: 'id',
      title: 'ID',
      align: 'center',
      width: 80,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'userId',
      title: '用户ID',
      align: 'center',
      width: 80,
    },
    {
      key: 'templateCode',
      title: '模板编码',
      align: 'center',
      minWidth: 120,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'templateNickname',
      title: '发送人',
      align: 'center',
      minWidth: 100,
    },
    {
      key: 'templateContent',
      title: '消息内容',
      align: 'center',
      minWidth: 200,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'readStatus',
      title: '已读状态',
      align: 'center',
      minWidth: 80,
      render(row) {
        const typedRow = row as unknown as Api.System.NotifyMessage;
        return (
          <NTag size="small" type={typedRow.readStatus ? 'success' : 'warning'}>
            {typedRow.readStatus ? '已读' : '未读'}
          </NTag>
        );
      },
    },
    {
      key: 'readTime',
      title: '已读时间',
      align: 'center',
      minWidth: 160,
      render(row) {
        const typedRow = row as unknown as Api.System.NotifyMessage;
        return typedRow.readTime || '-';
      },
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      minWidth: 160,
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: (row) => {
        const typedRow = row as unknown as Api.System.NotifyMessage;
        const divider = () => {
          if (!hasAuth('system:notify:message:query') || !hasAuth('system:notify:message:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const viewBtn = () => {
          if (!hasAuth('system:notify:message:query')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:visibility-outline"
              tooltipContent="查看详情"
              onClick={() => viewDetail(typedRow.id as string)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('system:notify:message:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(typedRow.id as string)}
            />
          );
        };

        return (
          <div class="flex-center gap-8px">
            {viewBtn()}
            {divider()}
            {deleteBtn()}
          </div>
        );
      },
    },
  ],
});

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, getData);

// Send drawer
const sendDrawerVisible = ref(false);

function handleSend() {
  sendDrawerVisible.value = true;
}

// Detail modal
const detailModalVisible = ref(false);
const currentMessageId = ref<string | null>(null);

function viewDetail(id: string) {
  currentMessageId.value = id;
  detailModalVisible.value = true;
}

async function handleBatchDelete() {
  try {
    await fetchNotifyMessageRemoveBatch((checkedRowKeys.value as string[]).join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(id: string) {
  try {
    await fetchNotifyMessageRemoveBatch(id);
    onDeleted();
  } catch {
    // error handled by request interceptor
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <MessageSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="站内信消息列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace>
          <NButton v-if="hasAuth('system:notify:message:send')" type="primary" @click="handleSend">
            <template #icon>
              <icon-material-symbols:send-outline />
            </template>
            发送站内信
          </NButton>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            :show-add="false"
            :show-delete="hasAuth('system:notify:message:remove')"
            :show-export="false"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </NSpace>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        v-bind="tableProps"
        :flex-height="!appStore.isMobile"
        :scroll-x="1100"
        :loading="loading"
        remote
        :row-key="(row) => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <MessageSendDrawer v-model:visible="sendDrawerVisible" @submitted="getData" />
      <MessageDetailModal v-model:visible="detailModalVisible" :message-id="currentMessageId" />
    </NCard>
  </div>
</template>

<style scoped></style>
