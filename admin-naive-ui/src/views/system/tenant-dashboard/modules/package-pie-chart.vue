<script setup lang="ts">
import { watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({
  name: 'PackagePieChart'
});

interface Props {
  data: Api.System.PackageDistribution[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false
});

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '1%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#5da8ff', '#8e9dff', '#fedc69', '#26deca', '#f472b6', '#a78bfa'],
      name: '套餐分布',
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: [] as { name: string; value: number }[]
    }
  ]
}));

watch(
  () => props.data,
  newData => {
    if (newData && newData.length > 0) {
      updateOptions(opts => {
        opts.series[0].data = newData.map(item => ({
          name: item.packageName,
          value: item.count
        }));
        return opts;
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <NCard title="套餐分布" :bordered="false" class="card-wrapper">
    <NSpin :show="loading">
      <div ref="domRef" class="h-360px overflow-hidden"></div>
    </NSpin>
  </NCard>
</template>

<style scoped></style>
