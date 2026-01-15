<script setup lang="tsx">
import { NDivider } from 'naive-ui';
import { fetchTenantPackageFindAll, fetchTenantPackageRemove } from '@/service/api-gen';
import { fetchUpdateTenantPackageStatus } from '@/service/api/system/tenant-package';
import type { TenantPackageResponseDto } from '@/service/api-gen/types';
import { useAppStore } from '@/store/modules/app';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { $t } from '@/locales';
import ButtonIcon from '@/components/custom/button-icon.vue';
import TableHeaderOperation from '@/components/advanced/table-header-operation.vue';
import StatusSwitch from '@/components/custom/status-switch.vue';
import TenantPackageSearch from './modules/tenant-package-search.vue';
import TenantPackageOperateDrawer from './modules/tenant-package-operate-drawer.vue';

defineOptions({
  name: 'TenantPackageList',
});

/** 本地搜索参数接口 */
interface TenantPackageSearchParams {
  pageNum?: number;
  pageSize?: number;
  packageName?: string | null;
  status?: string | null;
  params?: Record<string, unknown>;
}

const appStore = useAppStore();
const { download } = useDownload();
const { hasAuth } = useAuth();

useDict('sys_normal_disable', false);

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
  apiFn: fetchTenantPackageFindAll as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    packageName: null,
    status: null,
    params: {},
  } as TenantPackageSearchParams,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
    },
    {
      key: 'packageName',
      title: $t('page.system.tenantPackage.packageName'),
      align: 'center',
      minWidth: 120,
    },
    {
      key: 'status',
      title: $t('page.system.tenantPackage.status'),
      align: 'center',
      minWidth: 120,
      render: (row) => {
        const typedRow = row as unknown as TenantPackageResponseDto;
        return (
          <StatusSwitch
            v-model:value={typedRow.status}
            info={typedRow.packageName}
            onSubmitted={(value, callback) => handleStatusChange(typedRow, value, callback)}
          />
        );
      },
    },
    {
      key: 'remark',
      title: $t('page.system.tenantPackage.remark'),
      align: 'center',
      minWidth: 120,
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: (row) => {
        const typedRow = row as unknown as TenantPackageResponseDto;
        const divider = () => {
          if (!hasAuth('system:tenantPackage:edit') || !hasAuth('system:tenantPackage:remove')) {
            return null;
          }
          return <NDivider vertical />;
        };

        const editBtn = () => {
          if (!hasAuth('system:tenantPackage:edit')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="primary"
              icon="material-symbols:drive-file-rename-outline-outline"
              tooltipContent={$t('common.edit')}
              onClick={() => edit(typedRow.packageId!)}
            />
          );
        };

        const deleteBtn = () => {
          if (!hasAuth('system:tenantPackage:remove')) {
            return null;
          }
          return (
            <ButtonIcon
              text
              type="error"
              icon="material-symbols:delete-outline"
              tooltipContent={$t('common.delete')}
              popconfirmContent={$t('common.confirmDelete')}
              onPositiveClick={() => handleDelete(typedRow.packageId!)}
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
  useTableOperate(data as any, getData);

async function handleBatchDelete() {
  // request
  try {
    await fetchTenantPackageRemove(checkedRowKeys.value.join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(packageId: CommonType.IdType) {
  // request
  try {
    await fetchTenantPackageRemove(packageId);
    onDeleted();
  } catch {
    // error handled by request interceptor
  }
}

function edit(packageId: CommonType.IdType) {
  handleEdit('packageId' as any, packageId);
}

function handleExport() {
  download(
    '/system/tenant/package/export',
    searchParams,
    `${$t('page.system.tenantPackage.title')}_${new Date().getTime()}.xlsx`,
  );
}

/** 处理状态切换 */
async function handleStatusChange(
  row: TenantPackageResponseDto,
  value: string,
  callback: (flag: boolean) => void,
) {
  try {
    await fetchUpdateTenantPackageStatus({
      packageId: row.packageId,
      status: value as '0' | '1',
    });
    callback(true);
    window.$message?.success($t('page.system.tenantPackage.statusChangeSuccess'));
    getData();
  } catch {
    callback(false);
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TenantPackageSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard
      :title="$t('page.system.tenantPackage.title')"
      :bordered="false"
      size="small"
      class="card-wrapper sm:flex-1-hidden"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('system:tenantPackage:add')"
          :show-delete="hasAuth('system:tenantPackage:remove')"
          :show-export="hasAuth('system:tenantPackage:export')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="(row) => row.packageId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <TenantPackageOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData as any"
        @submitted="getData"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
