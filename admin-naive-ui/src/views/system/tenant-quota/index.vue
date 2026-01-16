<script setup lang="tsx">
import { NButton, NDivider, NTag } from 'naive-ui';
import { fetchGetTenantQuotaList } from '@/service/api/system/tenant';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import QuotaSearch from './modules/quota-search.vue';
import QuotaEditDrawer from './modules/quota-edit-drawer.vue';
import QuotaProgress from './modules/quota-progress.vue';

defineOptions({
  name: 'TenantQuotaList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const tableProps = useTableProps();

function getStatusType(status: Api.System.QuotaStatus): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'danger':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'success';
  }
}

function getStatusText(status: Api.System.QuotaStatus): string {
  switch (status) {
    case 'danger':
      return '超限';
    case 'warning':
      return '警告';
    default:
      return '正常';
  }
}

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
  apiFn: fetchGetTenantQuotaList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: null,
    companyName: null,
    status: null
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64
    },
    {
      key: 'tenantId',
      title: '租户编号',
      align: 'center',
      width: 100
    },
    {
      key: 'companyName',
      title: '企业名称',
      align: 'center',
      minWidth: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'userQuota',
      title: '用户配额',
      align: 'center',
      width: 180,
      render(row) {
        return <QuotaProgress used={row.userUsed} quota={row.userQuota} usageRate={row.userUsageRate} unit="人" />;
      }
    },
    {
      key: 'storageQuota',
      title: '存储配额',
      align: 'center',
      width: 180,
      render(row) {
        return (
          <QuotaProgress used={row.storageUsed} quota={row.storageQuota} usageRate={row.storageUsageRate} unit="MB" />
        );
      }
    },
    {
      key: 'apiQuota',
      title: 'API配额（月）',
      align: 'center',
      width: 180,
      render(row) {
        return <QuotaProgress used={row.apiUsed} quota={row.apiQuota} usageRate={row.apiUsageRate} unit="次" />;
      }
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 80,
      render(row) {
        return (
          <NTag type={getStatusType(row.status)} size="small">
            {getStatusText(row.status)}
          </NTag>
        );
      }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 100,
      render: row => {
        const editBtn = () => {
          return (
            <ButtonIcon
              type="primary"
              text
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(row.tenantId)}
            />
          );
        };

        const buttons = [];
        if (hasAuth('system:tenant:quota:edit')) buttons.push(editBtn());

        return (
          <div class="flex-center gap-8px">
            {buttons.map((btn, index) => (
              <>
                {index !== 0 && <NDivider vertical />}
                {btn}
              </>
            ))}
          </div>
        );
      }
    }
  ]
});

const { drawerVisible, operateType, editingData, handleEdit } = useTableOperate(data, getData);

function edit(tenantId: string) {
  handleEdit('tenantId', tenantId);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <QuotaSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="租户配额列表" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          :show-export="false"
          @refresh="getData"
        />
      </template>
      <NDataTable
        :columns="columns"
        :data="data"
        v-bind="tableProps"
        :flex-height="!appStore.isMobile"
        :scroll-x="1100"
        :loading="loading"
        remote
        :row-key="row => row.tenantId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <QuotaEditDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
