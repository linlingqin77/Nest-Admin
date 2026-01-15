<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { fetchGetTenantQuotaDetail, fetchUpdateTenantQuota } from '@/service/api/system/tenant';
import { $t } from '@/locales';

defineOptions({
  name: 'QuotaEditDrawer',
});

interface Props {
  operateType: NaiveUI.TableOperateType;
  rowData?: Api.System.TenantQuota | null;
}

interface Emits {
  (e: 'submitted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false,
});

const loading = ref(false);
const detailLoading = ref(false);
const quotaDetail = ref<Api.System.TenantQuotaDetail | Record<string, any> | null>(null);

type Model = Api.System.UpdateTenantQuotaParams;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    tenantId: '',
    userQuota: 0,
    storageQuota: 0,
    apiQuota: 0,
  };
}

const title = computed(() => {
  return `编辑配额 - ${quotaDetail.value?.companyName || ''}`;
});

async function loadQuotaDetail(tenantId: string) {
  detailLoading.value = true;
  try {
    const { data } = await fetchGetTenantQuotaDetail(tenantId);
    if (data) {
      quotaDetail.value = data;
      model.tenantId = data.tenantId;
      model.userQuota = data.userQuota;
      model.storageQuota = data.storageQuota;
      model.apiQuota = data.apiQuota;
    }
  } finally {
    detailLoading.value = false;
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  loading.value = true;
  try {
    const { error } = await fetchUpdateTenantQuota(model);
    if (!error) {
      window.$message?.success('配额更新成功');
      closeDrawer();
      emit('submitted');
    }
  } finally {
    loading.value = false;
  }
}

watch(visible, (newVal) => {
  if (newVal && props.rowData?.tenantId) {
    loadQuotaDetail(props.rowData.tenantId);
  } else {
    Object.assign(model, createDefaultModel());
    quotaDetail.value = null;
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="500">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="detailLoading">
        <NForm :model="model" label-placement="left" :label-width="100">
          <NFormItem label="租户编号">
            <NInput :value="model.tenantId" disabled />
          </NFormItem>
          <NFormItem label="企业名称">
            <NInput :value="quotaDetail?.companyName" disabled />
          </NFormItem>

          <NDivider>配额设置（-1表示不限制）</NDivider>

          <NFormItem label="用户数量配额" path="userQuota">
            <NInputNumber
              v-model:value="model.userQuota"
              :min="-1"
              placeholder="请输入用户数量配额"
              class="w-full"
            >
              <template #suffix>人</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem v-if="quotaDetail" label="当前使用">
            <NText>{{ quotaDetail.userUsed }} 人 ({{ Math.round(quotaDetail.userUsageRate) }}%)</NText>
          </NFormItem>

          <NFormItem label="存储空间配额" path="storageQuota">
            <NInputNumber
              v-model:value="model.storageQuota"
              :min="-1"
              placeholder="请输入存储空间配额"
              class="w-full"
            >
              <template #suffix>MB</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem v-if="quotaDetail" label="当前使用">
            <NText>{{ quotaDetail.storageUsed }} MB ({{ Math.round(quotaDetail.storageUsageRate) }}%)</NText>
          </NFormItem>

          <NFormItem label="API调用配额" path="apiQuota">
            <NInputNumber
              v-model:value="model.apiQuota"
              :min="-1"
              placeholder="请输入API调用配额（每月）"
              class="w-full"
            >
              <template #suffix>次/月</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem v-if="quotaDetail" label="当前使用">
            <NText>{{ quotaDetail.apiUsed }} 次 ({{ Math.round(quotaDetail.apiUsageRate) }}%)</NText>
          </NFormItem>

          <NDivider v-if="(quotaDetail as any)?.quotaHistory?.length">变更历史</NDivider>
          <NTimeline v-if="(quotaDetail as any)?.quotaHistory?.length">
            <NTimelineItem
              v-for="record in (quotaDetail as any).quotaHistory.slice(0, 5)"
              :key="record.id"
              :time="record.changeTime"
              :title="`${record.quotaType === 'user' ? '用户配额' : record.quotaType === 'storage' ? '存储配额' : 'API配额'}`"
            >
              <template #default>
                <NText depth="3">
                  {{ record.oldValue === -1 ? '不限' : record.oldValue }} →
                  {{ record.newValue === -1 ? '不限' : record.newValue }}
                  ({{ record.changeBy }})
                </NText>
              </template>
            </NTimelineItem>
          </NTimeline>
        </NForm>
      </NSpin>

      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
