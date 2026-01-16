<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'QuotaProgress'
});

interface Props {
  used: number;
  quota: number;
  usageRate: number;
  unit?: string;
}

const props = withDefaults(defineProps<Props>(), {
  unit: ''
});

const isUnlimited = computed(() => props.quota === -1);

const percentage = computed(() => {
  if (isUnlimited.value) return 0;
  return Math.min(Math.round(props.usageRate), 100);
});

const status = computed<'success' | 'warning' | 'error'>(() => {
  if (isUnlimited.value) return 'success';
  if (percentage.value >= 100) return 'error';
  if (percentage.value >= 80) return 'warning';
  return 'success';
});

const displayText = computed(() => {
  if (isUnlimited.value) {
    return `${props.used}${props.unit} / 不限`;
  }
  return `${props.used}${props.unit} / ${props.quota}${props.unit}`;
});
</script>

<template>
  <div class="quota-progress">
    <NProgress
      type="line"
      :percentage="percentage"
      :status="status"
      :height="16"
      :border-radius="4"
      :fill-border-radius="4"
      indicator-placement="inside"
    >
      <span class="text-12px">{{ isUnlimited ? '不限' : `${percentage}%` }}</span>
    </NProgress>
    <div class="mt-4px text-12px text-gray-500">{{ displayText }}</div>
  </div>
</template>

<style scoped>
.quota-progress {
  width: 100%;
}
</style>
