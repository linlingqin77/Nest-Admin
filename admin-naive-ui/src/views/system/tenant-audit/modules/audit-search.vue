<script setup lang="ts">
import { computed, ref } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'AuditSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.System.TenantAuditLogSearchParams>('model', { required: true });

const actionTypeOptions: any[] = [
  { label: '全部', value: null as string | null },
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '创建', value: 'create' },
  { label: '更新', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '权限变更', value: 'permission_change' },
  { label: '配置修改', value: 'config_change' },
  { label: '导出', value: 'export' },
  { label: '其他', value: 'other' }
];

const timeRange = ref<[number, number] | null>(null);

const timeRangeValue = computed({
  get: () => timeRange.value,
  set: val => {
    timeRange.value = val;
    if (val) {
      model.value.beginTime = new Date(val[0]).toISOString().split('T')[0];
      model.value.endTime = new Date(val[1]).toISOString().split('T')[0];
    } else {
      model.value.beginTime = null;
      model.value.endTime = null;
    }
  }
});

function reset() {
  timeRange.value = null;
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
        <NFormItemGi span="24 s:12 m:6" label="操作人" path="operatorName">
          <NInput v-model:value="model.operatorName" placeholder="请输入操作人" clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="操作类型" path="actionType">
          <NSelect
            v-model:value="model.actionType"
            :options="actionTypeOptions"
            placeholder="请选择操作类型"
            clearable
          />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="操作模块" path="module">
          <NInput v-model:value="model.module" placeholder="请输入操作模块" clearable />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="操作时间">
          <NDatePicker v-model:value="timeRangeValue" type="daterange" clearable class="w-full" />
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
