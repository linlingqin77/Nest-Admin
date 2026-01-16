<script setup lang="ts">
import { computed } from 'vue';

defineOptions({
  name: 'SmsLogDetailModal'
});

interface Props {
  /** the row data */
  rowData?: Api.System.SmsLog | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const sendStatusMap: Record<number, { label: string; type: NaiveUI.ThemeColor }> = {
  0: { label: '发送中', type: 'info' },
  1: { label: '成功', type: 'success' },
  2: { label: '失败', type: 'error' }
};

const receiveStatusMap: Record<number, { label: string; type: NaiveUI.ThemeColor }> = {
  0: { label: '未接收', type: 'warning' },
  1: { label: '已接收', type: 'success' }
};

const sendStatusInfo = computed((): { label: string; type: NaiveUI.ThemeColor } => {
  if (props.rowData?.sendStatus !== undefined) {
    return sendStatusMap[props.rowData.sendStatus] || { label: '未知', type: 'default' };
  }
  return { label: '未知', type: 'default' };
});

const receiveStatusInfo = computed((): { label: string; type: NaiveUI.ThemeColor } => {
  if (props.rowData?.receiveStatus !== undefined) {
    return receiveStatusMap[props.rowData.receiveStatus] || { label: '未知', type: 'default' };
  }
  return { label: '-', type: 'default' };
});

const paramsJson = computed(() => {
  if (props.rowData?.params) {
    return JSON.stringify(props.rowData.params, null, 2);
  }
  return '-';
});

function closeModal() {
  visible.value = false;
}
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="短信日志详情" :style="{ width: '600px' }">
    <NDescriptions :column="2" label-placement="left" bordered>
      <NDescriptionsItem label="日志ID">
        {{ rowData?.id || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="手机号">
        {{ rowData?.mobile || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="渠道编码">
        {{ rowData?.channelCode || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="模板编码">
        {{ rowData?.templateCode || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="发送状态">
        <NTag :type="sendStatusInfo.type" size="small">
          {{ sendStatusInfo.label }}
        </NTag>
      </NDescriptionsItem>
      <NDescriptionsItem label="接收状态">
        <NTag v-if="rowData?.receiveStatus !== undefined" :type="receiveStatusInfo.type" size="small">
          {{ receiveStatusInfo.label }}
        </NTag>
        <span v-else>-</span>
      </NDescriptionsItem>
      <NDescriptionsItem label="发送时间" :span="2">
        {{ rowData?.sendTime || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="接收时间" :span="2">
        {{ rowData?.receiveTime || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="短信内容" :span="2">
        {{ rowData?.content || '-' }}
      </NDescriptionsItem>
      <NDescriptionsItem label="参数" :span="2">
        <NCode :code="paramsJson" language="json" />
      </NDescriptionsItem>
      <NDescriptionsItem v-if="rowData?.apiSendCode" label="第三方发送编码" :span="2">
        {{ rowData.apiSendCode }}
      </NDescriptionsItem>
      <NDescriptionsItem v-if="rowData?.apiReceiveCode" label="第三方接收编码" :span="2">
        {{ rowData.apiReceiveCode }}
      </NDescriptionsItem>
      <NDescriptionsItem v-if="rowData?.errorMsg" label="错误信息" :span="2">
        <NText type="error">{{ rowData.errorMsg }}</NText>
      </NDescriptionsItem>
    </NDescriptions>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="closeModal">关闭</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
