<script setup lang="ts">
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NotifyMessageSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Record<string, any>>('model', { required: true });

const readStatusOptions = [
  { label: '未读', value: 'false' },
  { label: '已读', value: 'true' }
];

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
      <NCollapseItem :title="$t('common.search')" name="notify-message-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="用户ID" path="userId" class="pr-24px">
              <NInputNumber v-model:value="model.userId" placeholder="请输入用户ID" clearable class="w-full" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="模板编码" path="templateCode" class="pr-24px">
              <NInput v-model:value="model.templateCode" placeholder="请输入模板编码" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="已读状态" path="readStatus" class="pr-24px">
              <NSelect
                v-model:value="model.readStatus"
                :options="readStatusOptions"
                placeholder="请选择已读状态"
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
