<script setup lang="tsx">
import { computed } from 'vue';
import { NTag, NProgress } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

defineOptions({
  name: 'QuotaTopList',
});

interface Props {
  data: Api.System.QuotaTopTenant[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

function getProgressStatus(rate: number): 'success' | 'warning' | 'error' | 'default' {
  if (rate >= 100) return 'error';
  if (rate >= 80) return 'warning';
  return 'success';
}

const columns = computed<DataTableColumns<Api.System.QuotaTopTenant>>(() => [
  {
    key: 'companyName',
    title: '企业名称',
    minWidth: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'overallUsage',
    title: '综合使用率',
    width: 150,
    render(row) {
      const percentage = Math.round(row.overallUsage);
      return (
        <NProgress
          type="line"
          percentage={percentage}
          status={getProgressStatus(percentage)}
          indicator-placement="inside"
        />
      );
    },
  },
  {
    key: 'userQuotaUsage',
    title: '用户',
    width: 80,
    align: 'center',
    render(row) {
      const percentage = Math.round(row.userQuotaUsage);
      const type = percentage >= 100 ? 'error' : percentage >= 80 ? 'warning' : 'success';
      return <NTag type={type} size="small">{percentage}%</NTag>;
    },
  },
  {
    key: 'storageQuotaUsage',
    title: '存储',
    width: 80,
    align: 'center',
    render(row) {
      const percentage = Math.round(row.storageQuotaUsage);
      const type = percentage >= 100 ? 'error' : percentage >= 80 ? 'warning' : 'success';
      return <NTag type={type} size="small">{percentage}%</NTag>;
    },
  },
  {
    key: 'apiQuotaUsage',
    title: 'API',
    width: 80,
    align: 'center',
    render(row) {
      const percentage = Math.round(row.apiQuotaUsage);
      const type = percentage >= 100 ? 'error' : percentage >= 80 ? 'warning' : 'success';
      return <NTag type={type} size="small">{percentage}%</NTag>;
    },
  },
]);
</script>

<template>
  <NCard title="配额使用TOP10" :bordered="false" class="card-wrapper">
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="data"
        :bordered="false"
        :max-height="300"
        size="small"
        :pagination="false"
      />
      <NEmpty v-if="!loading && data.length === 0" description="暂无配额使用数据" />
    </NSpin>
  </NCard>
</template>

<style scoped></style>
