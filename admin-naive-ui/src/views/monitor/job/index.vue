<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NDivider } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { fetchJobList, fetchJobRemove } from '@/service/api-gen';
import { fetchChangeJobStatus, fetchRunJob } from '@/service/api/monitor/job';
import type { JobResponseDto } from '@/service/api-gen/types';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { useDict } from '@/hooks/business/dict';
import { useAuth } from '@/hooks/business/auth';
import { useDownload } from '@/hooks/business/download';
import ButtonIcon from '@/components/custom/button-icon.vue';
import { $t } from '@/locales';
import StatusSwitch from '@/components/custom/status-switch.vue';
import DictTag from '@/components/custom/dict-tag.vue';
import CronModal from '@/components/custom/cron-input/cron-modal.vue';
import JobSearch from './modules/job-search.vue';
import JobOperateDrawer from './modules/job-operate-drawer.vue';
import JobDetailDrawer from './modules/job-detail-drawer.vue';

defineOptions({
  name: 'JobList',
});

/** 搜索参数接口 */
interface SearchParams {
  pageNum: number;
  pageSize: number;
  jobName: string | null;
  jobGroup: string | null;
  status: string | null;
}

useDict('sys_job_group');
useDict('sys_job_status');

const { hasAuth } = useAuth();
const appStore = useAppStore();
const { download } = useDownload();

const { bool: detailVisible, setTrue: openDetailDrawer } = useBoolean();
const { bool: cronVisible, setTrue: openCronModal, setFalse: closeCronModal } = useBoolean();

const detailData = ref<JobResponseDto | null>(null);
const cronExpression = ref('');
const operateDrawerRef = ref<InstanceType<typeof JobOperateDrawer>>();

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
  apiFn: fetchJobList as any,
  apiParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: null,
    jobGroup: null,
    status: null,
  } as SearchParams,
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
      key: 'jobName',
      title: '任务名称',
      align: 'center',
      minWidth: 120,
      ellipsis: { tooltip: true },
    },
    {
      key: 'jobGroup',
      title: '任务组名',
      align: 'center',
      width: 100,
      render(row) {
        return <DictTag value={(row as unknown as JobResponseDto).jobGroup} dictCode="sys_job_group" />;
      },
    },
    {
      key: 'invokeTarget',
      title: '调用目标字符串',
      align: 'center',
      minWidth: 200,
      ellipsis: { tooltip: true },
    },
    {
      key: 'cronExpression',
      title: 'cron执行表达式',
      align: 'center',
      width: 150,
      ellipsis: { tooltip: true },
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      width: 80,
      render(row) {
        const typedRow = row as unknown as JobResponseDto;
        return (
          <StatusSwitch
            v-model:value={typedRow.status}
            info={typedRow.jobName}
            onSubmitted={(value: Api.Common.EnableStatus, callback: (flag: boolean) => void) => handleStatusChange(typedRow, value, callback)}
          />
        );
      },
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 220,
      render: (row) => {
        const typedRow = row as unknown as JobResponseDto;
        const editBtn = () => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:drive-file-rename-outline-outline"
            tooltipContent={$t('common.edit')}
            onClick={() => edit(typedRow.jobId!)}
          />
        );

        const deleteBtn = () => (
          <ButtonIcon
            text
            type="error"
            icon="material-symbols:delete-outline"
            tooltipContent={$t('common.delete')}
            popconfirmContent={$t('common.confirmDelete')}
            onPositiveClick={() => handleDelete(typedRow.jobId!)}
          />
        );

        const runBtn = () => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:play-arrow-outline"
            tooltipContent="执行一次"
            popconfirmContent={`确认要立即执行一次"${typedRow.jobName}"任务吗?`}
            onPositiveClick={() => handleRun(typedRow)}
          />
        );

        const viewBtn = () => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:visibility-outline"
            tooltipContent="任务详情"
            onClick={() => handleView(typedRow)}
          />
        );

        const logBtn = () => (
          <ButtonIcon
            text
            type="primary"
            icon="material-symbols:list-alt-outline"
            tooltipContent="调度日志"
            onClick={() => handleJobLog(typedRow)}
          />
        );

        const buttons = [];
        if (hasAuth('monitor:job:edit')) buttons.push(editBtn());
        if (hasAuth('monitor:job:remove')) buttons.push(deleteBtn());
        if (hasAuth('monitor:job:changeStatus')) buttons.push(runBtn());
        if (hasAuth('monitor:job:query')) buttons.push(viewBtn());
        if (hasAuth('monitor:job:query')) buttons.push(logBtn());

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
      },
    },
  ],
});

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data as any, getData);

async function handleBatchDelete() {
  try {
    await fetchJobRemove(checkedRowKeys.value.join(','));
    onBatchDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function handleDelete(jobId: CommonType.IdType) {
  try {
    await fetchJobRemove(String(jobId));
    onDeleted();
  } catch {
    // error handled by request interceptor
  }
}

async function edit(jobId: CommonType.IdType) {
  handleEdit('jobId' as any, jobId);
}

async function handleStatusChange(
  row: JobResponseDto,
  value: Api.Common.EnableStatus,
  callback: (flag: boolean) => void,
) {
  try {
    await fetchChangeJobStatus(row.jobId, value);
    callback(true);
    window.$message?.success('状态修改成功');
    getData();
  } catch {
    callback(false);
  }
}

async function handleRun(row: JobResponseDto) {
  try {
    await fetchRunJob(row.jobId, row.jobGroup);
    window.$message?.success('执行成功');
  } catch {
    // error handled by request interceptor
  }
}

function handleView(row: JobResponseDto) {
  detailData.value = jsonClone(row);
  openDetailDrawer();
}

function handleJobLog(row?: JobResponseDto) {
  // 跳转到调度日志页面
  const query = row ? { jobName: row.jobName, jobGroup: row.jobGroup } : {};
  window.open(`#/monitor/job-log?${new URLSearchParams(query as Record<string, string>).toString()}`, '_blank');
}

function handleExport() {
  download('/monitor/job/export', searchParams, `定时任务_${new Date().getTime()}.xlsx`);
}

function handleShowCron(expression: string) {
  cronExpression.value = expression;
  openCronModal();
}

function handleCronConfirm(cron: string) {
  operateDrawerRef.value?.handleCronChange(cron);
  closeCronModal();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-12px overflow-hidden lt-sm:overflow-auto">
    <JobSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />
    <NCard title="定时任务" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="hasAuth('monitor:job:add')"
          :show-delete="hasAuth('monitor:job:remove')"
          :show-export="hasAuth('monitor:job:export')"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="handleExport"
          @refresh="getData"
        >
          <template #after>
            <NButton v-if="hasAuth('monitor:job:query')" size="small" ghost @click="handleJobLog()">
              <template #icon>
                <icon-material-symbols:list-alt-outline class="text-icon" />
              </template>
              日志
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="1000"
        :loading="loading"
        remote
        :row-key="(row) => row.jobId"
        :pagination="mobilePagination"
        class="h-full"
      />
      <JobOperateDrawer
        ref="operateDrawerRef"
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="(editingData as JobResponseDto | null)"
        @submitted="getDataByPage"
        @show-cron="handleShowCron"
      />
      <JobDetailDrawer v-model:visible="detailVisible" :row-data="detailData" />
      <CronModal v-model:visible="cronVisible" :expression="cronExpression" @confirm="handleCronConfirm" />
    </NCard>
  </div>
</template>

<style scoped></style>
