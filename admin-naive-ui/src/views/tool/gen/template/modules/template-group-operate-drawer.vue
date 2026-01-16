<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { fetchTemplateGroupCreate, fetchTemplateGroupUpdate } from '@/service/api-gen';
import type { CreateTemplateGroupDto, TemplateGroupInfo, UpdateTemplateGroupDto } from '@/service/api-gen/template';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'TemplateGroupOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: TemplateGroupInfo | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增模板组',
    edit: '编辑模板组'
  };
  return titles[props.operateType];
});

type Model = {
  id?: number;
  name: string;
  description: string;
  isDefault: boolean;
  status: string;
};

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    name: '',
    description: '',
    isDefault: false,
    status: '0'
  };
}

type RuleKey = Extract<keyof Model, 'name'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  name: createRequiredRule('请输入模板组名称')
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, {
      id: props.rowData.id,
      name: props.rowData.name,
      description: props.rowData.description || '',
      isDefault: props.rowData.isDefault,
      status: props.rowData.status
    });
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  try {
    if (props.operateType === 'add') {
      const createData: CreateTemplateGroupDto = {
        name: model.name,
        description: model.description || undefined,
        isDefault: model.isDefault
      };
      await fetchTemplateGroupCreate(createData);
    } else if (props.operateType === 'edit' && model.id) {
      const updateData: UpdateTemplateGroupDto = {
        name: model.name,
        description: model.description || undefined,
        isDefault: model.isDefault,
        status: model.status
      };
      await fetchTemplateGroupUpdate(model.id, updateData);
    }

    window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch {
    // error handled by request interceptor
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="500" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem label="模板组名称" path="name">
          <NInput v-model:value="model.name" placeholder="请输入模板组名称" />
        </NFormItem>
        <NFormItem label="描述" path="description">
          <NInput v-model:value="model.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </NFormItem>
        <NFormItem label="默认模板组" path="isDefault">
          <NSwitch v-model:value="model.isDefault" />
        </NFormItem>
        <NFormItem v-if="operateType === 'edit'" label="状态" path="status">
          <NRadioGroup v-model:value="model.status">
            <NSpace>
              <NRadio value="0">正常</NRadio>
              <NRadio value="1">停用</NRadio>
            </NSpace>
          </NRadioGroup>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
