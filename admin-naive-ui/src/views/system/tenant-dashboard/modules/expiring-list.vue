<script setup lang="tsx">
import { computed } from 'vue';
import { NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

defineOptions({
  name: 'ExpiringList',
});

interface Props {
  data: Api.System.ExpiringTenant[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const columns = computed<DataTableColumns<Api.System.ExpiringTenant>>(() => [
  {
    key: 'companyName',
    title: '企业名称',
    minWidth: 120,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    key: 'packageName',
    title: '套餐',
    width: 100,
  },
  {
    key: 'daysRemaining',
    title: '剩余天数',
    width: 100,
    align: 'center',
    render(row) {
      const type = row.daysRemaining <= 7 ? 'error' : row.daysRemaining <= 15 ? 'warning' : 'info';
      return <NTag type={type} size="small">{row.daysRemaining}天</NTag>;
    },
  },
  {
    key: 'expireTime',
    title: '到期时间',
    width: 120,
    render(row) {
      return row.expireTime ? new Date(row.expireTime).toLocaleDateString() : '-';
    },
  },
]);
</script>

<template>
  <NCard title="即将到期租户（30天内）" :bordered="false" class="card-wrapper">
    <NSpin :show="loading">
      <NDataTable
        :columns="columns"
        :data="data"
        :bordered="false"
        :max-height="300"
        size="small"
        :pagination="false"
      />
      <NEmpty v-if="!loading && data.length === 0" description="暂无即将到期的租户" />
    </NSpin>
  </NCard>
</template>

<style scoped></style>
