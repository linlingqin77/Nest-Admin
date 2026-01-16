<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import { fetchFileManagerGetStorageStats } from '@/service/api-gen';
import type { StorageStatsResponseDto } from '@/service/api-gen/types';

const message = useMessage();
const loading = ref(false);

const stats = ref<StorageStatsResponseDto>({
  used: 0,
  quota: 0,
  percentage: 0,
  remaining: 0,
  companyName: ''
});

/** 格式化文件大小 */
function formatSize(mb: number): string {
  if (mb < 1024) {
    return `${mb.toFixed(0)} MB`;
  }
  return `${(mb / 1024).toFixed(2)} GB`;
}

/** 获取进度条状态 */
function getProgressStatus(percentage: number): 'success' | 'warning' | 'error' | 'default' {
  if (percentage >= 95) return 'error';
  if (percentage >= 80) return 'warning';
  return 'success';
}

/** 获取存储统计 */
async function getStats() {
  loading.value = true;
  try {
    const { data } = await fetchFileManagerGetStorageStats();
    if (data) {
      stats.value = data;
    }
  } catch (error) {
    message.error('获取存储统计失败');
  } finally {
    loading.value = false;
  }
}

/** 刷新 */
function refresh() {
  getStats();
}

onMounted(() => {
  getStats();
});

defineExpose({
  refresh
});
</script>

<template>
  <div class="storage-stats-card">
    <NSpin :show="loading">
      <NSpace vertical :size="16">
        <NSpace justify="space-between" align="center">
          <NText strong>存储空间</NText>
          <NButton text @click="refresh">
            <template #icon>
              <icon-carbon-renew />
            </template>
          </NButton>
        </NSpace>

        <NProgress
          type="line"
          :percentage="stats.percentage"
          :status="getProgressStatus(stats.percentage)"
          :show-indicator="false"
        />

        <NSpace justify="space-between">
          <NText depth="3" class="text-sm">已用 {{ formatSize(stats.used) }} / {{ formatSize(stats.quota) }}</NText>
          <NText depth="3" class="text-sm">{{ stats.percentage.toFixed(1) }}%</NText>
        </NSpace>

        <NText v-if="stats.remaining < 1024" type="warning" class="text-sm">
          <icon-carbon-warning class="mr-1 inline-block" />
          存储空间即将用尽
        </NText>
      </NSpace>
    </NSpin>
  </div>
</template>

<style scoped>
.storage-stats-card {
  padding: 16px;
  background: var(--n-color);
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
}
</style>
