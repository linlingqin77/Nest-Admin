<script setup lang="ts">
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NotifyTemplateSearch',
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.System.NotifyTemplateSearchParams>('model', { required: true });

const templateTypeOptions = [
  { label: '系统通知', value: 1 },
  { label: '业务通知', value: 2 },
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
      <NCollapseItem :title="$t('common.search')" name="notify-template-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" label="模板名称" path="name" class="pr-24px">
              <NInput v-model:value="model.name" placeholder="请输入模板名称" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="模板编码" path="code" class="pr-24px">
              <NInput v-model:value="model.code" placeholder="请输入模板编码" clearable />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="模板类型" path="type" class="pr-24px">
              <NSelect
                v-model:value="model.type"
                :options="templateTypeOptions"
                placeholder="请选择模板类型"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="状态" path="status" class="pr-24px">
              <DictSelect v-model:value="model.status" dict-code="sys_normal_disable" placeholder="请选择状态" />
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
