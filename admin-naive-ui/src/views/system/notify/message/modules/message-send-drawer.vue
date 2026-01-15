<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import { fetchNotifyMessageSend, fetchNotifyMessageSendAll, fetchNotifyTemplateGetSelectList } from '@/service/api-gen';

interface SendNotifyMessageDto {
  userIds: number[];
  templateCode: string;
  params?: Record<string, string>;
}

interface SendNotifyAllDto {
  templateCode: string;
  params?: Record<string, string>;
}
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NotifyMessageSendDrawer',
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false,
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const templateOptions = ref<{ label: string; value: string }[]>([]);
const sendType = ref<'single' | 'all'>('single');

async function loadTemplateOptions() {
  try {
    const { data } = await fetchNotifyTemplateGetSelectList() as any;
    templateOptions.value = (data || []).map((item: any) => ({
      label: `${item.name} (${item.code})`,
      value: item.code,
    }));
  } catch {
    // error handled by request interceptor
  }
}

onMounted(() => {
  loadTemplateOptions();
});

const title = computed(() => {
  return sendType.value === 'single' ? '发送站内信' : '群发站内信';
});

interface Model {
  userIds: number[];
  templateCode: string;
  params: Record<string, string>;
}

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    userIds: [],
    templateCode: '',
    params: {},
  };
}

const rules = {
  templateCode: createRequiredRule('请选择模板'),
  userIds: {
    required: true,
    validator: (_rule: unknown, value: number[]) => {
      if (sendType.value === 'single' && (!value || value.length === 0)) {
        return new Error('请输入接收用户ID');
      }
      return true;
    },
    trigger: 'blur',
  },
};

// 动态参数输入
const paramsArray = ref<{ key: string; value: string }[]>([]);

function addParam() {
  paramsArray.value.push({ key: '', value: '' });
}

function removeParam(index: number) {
  paramsArray.value.splice(index, 1);
  updateModelParams();
}

function updateModelParams() {
  const params: Record<string, string> = {};
  paramsArray.value.forEach((item) => {
    if (item.key) {
      params[item.key] = item.value;
    }
  });
  model.params = params;
}

// 用户ID输入
const userIdsInput = ref('');

function parseUserIds() {
  const ids = userIdsInput.value
    .split(/[,，\s]+/)
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
  model.userIds = ids;
}

function handleUpdateModelWhenOpen() {
  Object.assign(model, createDefaultModel());
  paramsArray.value = [];
  userIdsInput.value = '';
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  parseUserIds();
  updateModelParams();

  try {
    if (sendType.value === 'single') {
      const sendData: SendNotifyMessageDto = {
        userIds: model.userIds,
        templateCode: model.templateCode,
        params: Object.keys(model.params).length > 0 ? model.params : undefined,
      };
      await fetchNotifyMessageSend(sendData);
    } else {
      const sendAllData: SendNotifyAllDto = {
        templateCode: model.templateCode,
        params: Object.keys(model.params).length > 0 ? model.params : undefined,
      };
      await fetchNotifyMessageSendAll(sendAllData);
    }

    window.$message?.success('发送成功');
    closeDrawer();
    emit('submitted');
  } catch {
    // error handled by request interceptor
  }
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenOpen();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem label="发送类型">
          <NRadioGroup v-model:value="sendType">
            <NRadio value="single">指定用户</NRadio>
            <NRadio value="all">全部用户</NRadio>
          </NRadioGroup>
        </NFormItem>
        <NFormItem v-if="sendType === 'single'" label="接收用户ID" path="userIds">
          <NInput
            v-model:value="userIdsInput"
            placeholder="请输入用户ID，多个用逗号分隔"
            @blur="parseUserIds"
          />
        </NFormItem>
        <NFormItem label="消息模板" path="templateCode">
          <NSelect
            v-model:value="model.templateCode"
            :options="templateOptions"
            placeholder="请选择消息模板"
            filterable
          />
        </NFormItem>
        <NFormItem label="模板参数">
          <div class="w-full">
            <div v-for="(param, index) in paramsArray" :key="index" class="flex gap-8px mb-8px">
              <NInput
                v-model:value="param.key"
                placeholder="参数名"
                class="flex-1"
                @blur="updateModelParams"
              />
              <NInput
                v-model:value="param.value"
                placeholder="参数值"
                class="flex-1"
                @blur="updateModelParams"
              />
              <NButton type="error" text @click="removeParam(index)">
                <template #icon>
                  <icon-material-symbols:delete-outline />
                </template>
              </NButton>
            </div>
            <NButton size="small" dashed @click="addParam">
              <template #icon>
                <icon-material-symbols:add-rounded />
              </template>
              添加参数
            </NButton>
          </div>
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">发送</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
