<script setup lang="tsx">
import { NButton, NDivider, NTag } from 'naive-ui';
import { fetchExportTenantAuditLog, fetchGetTenantAuditLogList } from '@/service/api/system/tenant';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useTable, useTableOperate, useTableProps } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import AuditSearch from './modules/audit-search.vue';
import AuditDetailModal from './modules/audit-detail-modal.vue';

defineOptions({
  name: 'TenantAuditLogList'
});

const appStore = useAppStore();
const { hasAuth } = useAuth();
const tableProps = useTableProps();

const actionTypeMap: Record<string, { label: string; type: NaiveUI.ThemeColor }> = {
  login: { label: '登录', type: 'success' },
  logout: { label: '登出', type: 'info' },
  create: { label: '创建', type: 'primary' },
  update: { label: '更新', type: 'warning' },
  delete: { label: '删除', type: 'error' },
  permission_change: { label: '权限变更', type: 'warning' },
  config_change: { label: '配置修改', type: 'info' },
  export: { label: '导出', type: 'default' },
  other: { label: '其他', type: 'default' }
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
  apiFn: fetchGetTenantAuditLogList,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: null,
    operatorName: null,
    actionType: null,
    module: null,
    beginTime: null,
    endTime: null
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64
    },
    {
      key: 'operateTime',
      title: '操作时间',
      align: 'center',
      width: 160,
      render(row) {
        return row.operateTime ? new Date(row.operateTime).toLocaleString() : '-';
      }
    },
    {
      key: 'companyName',
      title: '租户',
      align: 'center',
      width: 120,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'operatorName',
      title: '操作人',
      align: 'center',
      width: 100
    },
    {
      key: 'actionType',
      title: '操作类型',
      align: 'center',
      width: 100,
      render(row) {
        const config = actionTypeMap[row.actionType] || actionTypeMap.other;
        return (
          <NTag type={config.type} size="small">
            {config.label}
          </NTag>
        );
      }
    },
    {
      key: 'module',
      title: '操作模块',
      align: 'center',
      width: 100
    },
    {
      key: 'actionDesc',
      title: '操作描述',
      align: 'center',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'ipAddress',
      title: 'IP地址',
      align: 'center',
      width: 130
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 80,
      render: row => {
        return (
          <ButtonIcon
            type="primary"
            text
            icon="material-symbols:visibility-outline"
            tooltipContent="查看详情"
            onClick={() => viewDetail(row)}
          />
        );
      }
    }
  ]
});

const { drawerVisible, editingData, handleEdit } = useTableOperate(data, getData);

function viewDetail(row: Api.System.TenantAuditLog) {
  handleEdit('id', row.id);
}

async function handleExport() {
  try {
    const blob = await fetchExportTenantAuditLog(searchParams);
    if (blob) {
      const url = window.URL.createObjectURL(blob.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `审计日志_${new Date().getTime()}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      window.$message?.success('导出成功');
    }
  } catch {
    window.$message?.error('导出失败');
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <AuditSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="租户审计日志" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
          :show-export="hasAuth('system:tenant:audit:export')"
          @export="handleExport"
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
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <AuditDetailModal v-model:visible="drawerVisible" :row-data="editingData" />
    </NCard>
  </div>
</template>

<style scoped></style>
