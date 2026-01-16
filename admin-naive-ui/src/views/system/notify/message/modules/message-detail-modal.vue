<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchNotifyMessageFindOne } from '@/service/api-gen';

defineOptions({
  name: 'NotifyMessageDetailModal'
});

interface Props {
  messageId?: string | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const loading = ref(false);
const messageDetail = ref<Api.System.NotifyMessage | null>(null);

async function loadDetail() {
  if (!props.messageId) return;

  loading.value = true;
  try {
    const { data } = (await fetchNotifyMessageFindOne(props.messageId)) as any;
    messageDetail.value = data;
  } catch {
    // error handled by request interceptor
  } finally {
    loading.value = false;
  }
}

function formatParams(params?: string): string {
  if (!params) return '-';
  try {
    return JSON.stringify(JSON.parse(params), null, 2);
  } catch {
    return params;
  }
}

watch(visible, () => {
  if (visible.value && props.messageId) {
    loadDetail();
  }
});
</script>

<template>
  <NModal v-model:show="visible" preset="card" title="站内信详情" :style="{ width: '600px' }">
    <NSpin :show="loading">
      <NDescriptions v-if="messageDetail" :column="1" label-placement="left" bordered>
        <NDescriptionsItem label="消息ID">{{ messageDetail.id }}</NDescriptionsItem>
        <NDescriptionsItem label="用户ID">{{ messageDetail.userId }}</NDescriptionsItem>
        <NDescriptionsItem label="模板编码">{{ messageDetail.templateCode }}</NDescriptionsItem>
        <NDescriptionsItem label="发送人">{{ messageDetail.templateNickname }}</NDescriptionsItem>
        <NDescriptionsItem label="消息内容">
          <div class="whitespace-pre-wrap">{{ messageDetail.templateContent }}</div>
        </NDescriptionsItem>
        <NDescriptionsItem label="模板参数">
          <NCode :code="formatParams(messageDetail.templateParams)" language="json" />
        </NDescriptionsItem>
        <NDescriptionsItem label="已读状态">
          <NTag :type="messageDetail.readStatus ? 'success' : 'warning'" size="small">
            {{ messageDetail.readStatus ? '已读' : '未读' }}
          </NTag>
        </NDescriptionsItem>
        <NDescriptionsItem v-if="messageDetail.readTime" label="已读时间">
          {{ messageDetail.readTime }}
        </NDescriptionsItem>
        <NDescriptionsItem label="创建时间">{{ messageDetail.createTime }}</NDescriptionsItem>
      </NDescriptions>
    </NSpin>
  </NModal>
</template>

<style scoped></style>
