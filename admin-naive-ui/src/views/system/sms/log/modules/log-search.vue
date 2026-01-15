<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNaiveForm } from '@/hooks/common/form';
import { fetchSmsChannelGetEnabledChannels } from '@/service/api-gen';
import { $t } from '@/locales';

defineOptions({
  name: 'SmsLogSearch',
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.System.SmsLogSearchParams>('model', { required: true });

const channelOptions = ref<{ label: string; value: number }[]>([]);

const sendStatusOptions = [
  { label: '发送中', value: 0 },
  { label: '成功', value: 1 },
  { label: '失败', value: 2 },
];

async function loadChannelOptions() {
  try {
    const { data } = await fetchSmsChannelGetEnabledChannels();
    if (data && Array.isArray(data)) {
      channelOptions.value = data.map((item: any) => ({
        label: item.name,
        value: item.id as number,
      }));
    }
  } catch {
    // error handled by request interceptor
  }
}

onMounted(() => {
  loadChannelOptions();
});

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse>
      <NCollapseItem :title="$t('common.search')" name="sms-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="手机号" path="mobile" class="pr-24px">
              <NInput v-model:value="model.mobile" placeholder="请输入手机号" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="短信渠道" path="channelId" class="pr-24px">
              <NSelect
                v-model:value="model.channelId"
                :options="channelOptions"
                placeholder="请选择短信渠道"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="发送状态" path="sendStatus" class="pr-24px">
              <NSelect
                v-model:value="model.sendStatus"
                :options="sendStatusOptions"
                placeholder="请选择发送状态"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" class="pr-24px">
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
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
