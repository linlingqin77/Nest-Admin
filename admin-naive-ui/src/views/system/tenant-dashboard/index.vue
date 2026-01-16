<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchGetDashboardData } from '@/service/api/system/tenant';
import { useAppStore } from '@/store/modules/app';
import StatCards from './modules/stat-cards.vue';
import TrendChart from './modules/trend-chart.vue';
import PackagePieChart from './modules/package-pie-chart.vue';
import ExpiringList from './modules/expiring-list.vue';
import QuotaTopList from './modules/quota-top-list.vue';

defineOptions({
  name: 'TenantDashboard'
});

const appStore = useAppStore();
const loading = ref(false);
const dashboardData = ref<Api.System.TenantDashboardData | null>(null);

const gap = computed(() => (appStore.isMobile ? 0 : 16));

// 时间范围（默认最近30天）
const timeRange = ref<[number, number] | null>(null);

async function loadDashboardData() {
  loading.value = true;
  try {
    const params: Api.System.DashboardTimeRangeParams = {};
    if (timeRange.value) {
      params.beginTime = new Date(timeRange.value[0]).toISOString().split('T')[0];
      params.endTime = new Date(timeRange.value[1]).toISOString().split('T')[0];
    }
    const { data } = await (fetchGetDashboardData as any)(params);
    if (data) {
      dashboardData.value = data;
    }
  } finally {
    loading.value = false;
  }
}

function handleTimeRangeChange() {
  loadDashboardData();
}

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <!-- 时间范围选择 -->
    <NCard :bordered="false" size="small" class="card-wrapper">
      <div class="flex items-center gap-16px">
        <span class="text-14px">时间范围：</span>
        <NDatePicker
          v-model:value="timeRange"
          type="daterange"
          clearable
          :shortcuts="{
            最近7天: () => {
              const end = Date.now();
              const start = end - 7 * 24 * 60 * 60 * 1000;
              return [start, end];
            },
            最近30天: () => {
              const end = Date.now();
              const start = end - 30 * 24 * 60 * 60 * 1000;
              return [start, end];
            },
            最近90天: () => {
              const end = Date.now();
              const start = end - 90 * 24 * 60 * 60 * 1000;
              return [start, end];
            }
          }"
          @update:value="handleTimeRangeChange"
        />
        <NButton type="primary" :loading="loading" @click="loadDashboardData">
          <template #icon>
            <icon-material-symbols:refresh />
          </template>
          刷新
        </NButton>
      </div>
    </NCard>

    <!-- 统计卡片 -->
    <StatCards :stats="dashboardData?.stats" :loading="loading" />

    <!-- 图表区域 -->
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14">
        <TrendChart :data="dashboardData?.trend || []" :loading="loading" />
      </NGi>
      <NGi span="24 s:24 m:10">
        <PackagePieChart :data="dashboardData?.packageDistribution || []" :loading="loading" />
      </NGi>
    </NGrid>

    <!-- 列表区域 -->
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:12">
        <ExpiringList :data="dashboardData?.expiringTenants || []" :loading="loading" />
      </NGi>
      <NGi span="24 s:24 m:12">
        <QuotaTopList :data="dashboardData?.quotaTopTenants || []" :loading="loading" />
      </NGi>
    </NGrid>
  </div>
</template>

<style scoped></style>
