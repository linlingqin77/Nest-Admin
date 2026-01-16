<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({
  name: 'QuotaSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.System.TenantQuotaSearchParams>('model', { required: true });

const statusOptions: any[] = [
  { label: '全部', value: null as string | null },
  { label: '正常', value: 'normal' },
  { label: '警告', value: 'warning' },
  { label: '超限', value: 'danger' }
];

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NForm :model="model" label-placement="left" :label-width="80">
      <NGrid responsive="screen" item-responsive>
        <NFormItemGi span="24 s:12 m:6" label="租户编号" path="tenantId">
          <NInput v-model:value="model.tenantId" placeholder="请输入租户编号" clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="企业名称" path="companyName">
          <NInput v-model:value="model.companyName" placeholder="请输入企业名称" clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="配额状态" path="status">
          <NSelect v-model:value="model.status" :options="statusOptions" placeholder="请选择状态" clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6">
          <NSpace class="w-full" justify="end">
            <NButton @click="reset">
              <template #icon>
                <SvgIcon icon="ic:round-refresh" class="text-icon" />
              </template>
              {{ $t('common.reset') }}
            </NButton>
            <NButton type="primary" ghost @click="search">
              <template #icon>
                <SvgIcon icon="ic:round-search" class="text-icon" />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NFormItemGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped></style>
