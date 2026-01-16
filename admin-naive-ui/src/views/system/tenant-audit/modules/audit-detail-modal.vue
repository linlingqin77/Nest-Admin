<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchGetTenantAuditLogDetail } from '@/service/api/system/tenant';

defineOptions({
  name: 'AuditDetailModal'
});

interface Props {
  rowData?: Api.System.TenantAuditLog | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const loading = ref(false);
const detail = ref<Api.System.TenantAuditLogDetail | null>(null);

const actionTypeMap: Record<string, string> = {
  login: '登录',
  logout: '登出',
  create: '创建',
  update: '更新',
  delete: '删除',
  permission_change: '权限变更',
  config_change: '配置修改',
  export: '导出',
  other: '其他'
};

async function loadDetail(id: number | string) {
  loading.value = true;
  try {
    const { data } = await fetchGetTenantAuditLogDetail(id);
    if (data) {
      detail.value = data;
    }
  } finally {
    loading.value = false;
  }
}

function formatJson(jsonStr?: string): string {
  if (!jsonStr) return '-';
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

watch(visible, newVal => {
  if (newVal && props.rowData?.id) {
    loadDetail(props.rowData.id);
  } else {
    detail.value = null;
  }
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    title="审计日志详情"
    :style="{ width: '700px' }"
    :segmented="{ content: true }"
  >
    <NSpin :show="loading">
      <NDescriptions v-if="detail" :column="2" label-placement="left" bordered>
        <NDescriptionsItem label="日志ID">{{ detail.id }}</NDescriptionsItem>
        <NDescriptionsItem label="租户">{{ detail.companyName || detail.tenantId }}</NDescriptionsItem>
        <NDescriptionsItem label="操作人">{{ detail.operatorName }}</NDescriptionsItem>
        <NDescriptionsItem label="操作类型">
          <NTag size="small">{{ actionTypeMap[detail.actionType] || detail.actionType }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem label="操作模块">{{ detail.module }}</NDescriptionsItem>
        <NDescriptionsItem label="操作时间">
          {{ detail.operateTime ? new Date(detail.operateTime).toLocaleString() : '-' }}
        </NDescriptionsItem>
        <NDescriptionsItem label="IP地址">{{ detail.ipAddress }}</NDescriptionsItem>
        <NDescriptionsItem label="请求方法">{{ detail.requestMethod || '-' }}</NDescriptionsItem>
        <NDescriptionsItem label="请求URL" :span="2">{{ detail.requestUrl || '-' }}</NDescriptionsItem>
        <NDescriptionsItem label="操作描述" :span="2">{{ detail.actionDesc }}</NDescriptionsItem>
        <NDescriptionsItem label="User Agent" :span="2">
          <NEllipsis :line-clamp="2">{{ detail.userAgent || '-' }}</NEllipsis>
        </NDescriptionsItem>
      </NDescriptions>

      <template v-if="detail">
        <NDivider v-if="detail.requestParams">请求参数</NDivider>
        <NCode v-if="detail.requestParams" :code="formatJson(detail.requestParams)" language="json" />

        <NDivider v-if="detail.beforeData">操作前数据</NDivider>
        <NCode v-if="detail.beforeData" :code="formatJson(detail.beforeData)" language="json" />

        <NDivider v-if="detail.afterData">操作后数据</NDivider>
        <NCode v-if="detail.afterData" :code="formatJson(detail.afterData)" language="json" />

        <NDivider v-if="detail.responseData">响应数据</NDivider>
        <NCode v-if="detail.responseData" :code="formatJson(detail.responseData)" language="json" />
      </template>
    </NSpin>
  </NModal>
</template>

<style scoped></style>
