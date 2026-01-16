<script setup lang="ts">
import { watch } from 'vue';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({
  name: 'TrendChart'
});

interface Props {
  data: Api.System.TenantTrendData[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false
});

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['新增租户', '累计租户'],
    top: '0'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[]
  },
  yAxis: [
    {
      type: 'value',
      name: '新增',
      position: 'left'
    },
    {
      type: 'value',
      name: '累计',
      position: 'right'
    }
  ],
  series: [
    {
      color: '#8e9dff',
      name: '新增租户',
      type: 'bar',
      yAxisIndex: 0,
      data: [] as number[]
    },
    {
      color: '#26deca',
      name: '累计租户',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.25,
              color: '#26deca'
            },
            {
              offset: 1,
              color: '#fff'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    }
  ]
}));

watch(
  () => props.data,
  newData => {
    if (newData && newData.length > 0) {
      updateOptions(opts => {
        opts.xAxis.data = newData.map(item => item.date);
        opts.series[0].data = newData.map(item => item.newTenants);
        opts.series[1].data = newData.map(item => item.totalTenants);
        return opts;
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <NCard title="租户增长趋势" :bordered="false" class="card-wrapper">
    <NSpin :show="loading">
      <div ref="domRef" class="h-360px overflow-hidden"></div>
    </NSpin>
  </NCard>
</template>

<style scoped></style>
