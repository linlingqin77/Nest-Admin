<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  fetchGetUnreadCount,
  fetchGetRecentMessages,
  fetchMarkAsRead,
  fetchMarkAllAsRead,
} from '@/service/api/system/notify';

defineOptions({
  name: 'NotifyBell',
});

const router = useRouter();
const show = ref(false);
const loading = ref(false);
const unreadCount = ref(0);
const recentMessages = ref<Api.System.NotifyMessage[]>([]);

// Polling interval (30 seconds)
let pollingTimer: ReturnType<typeof setInterval> | null = null;

async function loadUnreadCount() {
  try {
    const { data } = await fetchGetUnreadCount();
    unreadCount.value = data ?? 0;
  } catch {
    // error handled by request interceptor
  }
}

async function loadRecentMessages() {
  loading.value = true;
  try {
    const { data } = await fetchGetRecentMessages();
    recentMessages.value = data ?? [];
  } catch {
    // error handled by request interceptor
  } finally {
    loading.value = false;
  }
}

async function handleMarkAsRead(message: Api.System.NotifyMessage) {
  if (message.readStatus) return;

  try {
    await fetchMarkAsRead([message.id]);
    message.readStatus = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch {
    // error handled by request interceptor
  }
}

async function handleMarkAllAsRead() {
  try {
    await fetchMarkAllAsRead();
    recentMessages.value.forEach((msg) => {
      msg.readStatus = true;
    });
    unreadCount.value = 0;
    window.$message?.success('已全部标记为已读');
  } catch {
    // error handled by request interceptor
  }
}

function goToMessageList() {
  show.value = false;
  router.push('/system/notify/message');
}

function formatTime(time: string | undefined) {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return time.substring(0, 10);
}

const displayCount = computed(() => {
  return unreadCount.value > 99 ? '99+' : unreadCount.value;
});

function startPolling() {
  loadUnreadCount();
  pollingTimer = setInterval(() => {
    loadUnreadCount();
  }, 30000);
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});

// Load recent messages when popover opens
function handlePopoverShow(visible: boolean) {
  if (visible) {
    loadRecentMessages();
  }
}
</script>

<template>
  <NPopover
    v-model:show="show"
    trigger="click"
    arrow-point-to-center
    raw
    class="border-rounded-6px"
    @update:show="handlePopoverShow"
  >
    <template #trigger>
      <NTooltip :disabled="show">
        <template #trigger>
          <NButton quaternary class="bell-button h-36px text-icon" :focusable="false">
            <NBadge :value="displayCount" :max="99" :offset="[2, -2]" :show="unreadCount > 0">
              <div class="bell-icon flex-center gap-8px">
                <SvgIcon local-icon="bell" />
              </div>
            </NBadge>
          </NButton>
        </template>
        站内信
      </NTooltip>
    </template>
    <NCard
      size="small"
      :bordered="false"
      class="w-360px"
      header-class="p-0"
      :segmented="{ content: true, footer: 'soft' }"
    >
      <template #header>
        <div class="flex items-center gap-8px">
          <span>站内信</span>
          <NTag v-if="unreadCount > 0" type="error" size="small" round>{{ unreadCount }}</NTag>
        </div>
      </template>
      <template #header-extra>
        <NTooltip placement="left" :z-index="98">
          <template #trigger>
            <NPopconfirm @positive-click="handleMarkAllAsRead">
              <template #trigger>
                <NButton quaternary :disabled="unreadCount === 0">
                  <div class="flex-center gap-8px">
                    <SvgIcon icon="lucide:mail-check" class="text-16px" />
                  </div>
                </NButton>
              </template>
              确定全部标记为已读吗？
            </NPopconfirm>
          </template>
          全部已读
        </NTooltip>
      </template>
      <NSpin :show="loading">
        <NScrollbar class="h-300px">
          <template v-if="recentMessages.length">
            <div
              v-for="(message, index) in recentMessages"
              :key="message.id"
              class="message-item cursor-pointer p-12px hover:bg-gray-100 dark:hover:bg-gray-800"
              :class="{ 'border-t border-gray-200 dark:border-gray-700': index !== 0 }"
              @click="handleMarkAsRead(message)"
            >
              <div class="flex items-start justify-between gap-8px">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-8px mb-4px">
                    <span class="font-medium text-14px">{{ message.templateNickname }}</span>
                    <NTag v-if="!message.readStatus" type="error" size="tiny">未读</NTag>
                  </div>
                  <NEllipsis :line-clamp="2" class="text-13px text-gray-600 dark:text-gray-400">
                    {{ message.templateContent }}
                  </NEllipsis>
                  <div class="text-12px text-gray-400 mt-4px">
                    {{ formatTime(message.createTime) }}
                  </div>
                </div>
              </div>
            </div>
          </template>
          <NEmpty v-else class="h-200px flex-center" description="暂无消息" />
        </NScrollbar>
      </NSpin>
      <template #footer>
        <div class="flex items-center justify-center">
          <NButton type="primary" text @click="goToMessageList">
            查看全部消息
            <template #icon>
              <SvgIcon icon="material-symbols:arrow-forward" />
            </template>
          </NButton>
        </div>
      </template>
    </NCard>
  </NPopover>
</template>

<style scoped lang="scss">
:deep(.n-badge-sup) {
  padding: 0 5px !important;
  font-size: 10px !important;
  height: 15px !important;
  line-height: 15px !important;
}

.bell-button {
  &:hover {
    .bell-icon {
      animation: bell-ring 1s both;
    }
  }
}

.message-item {
  transition: background-color 0.2s;
}

@keyframes bell-ring {
  0%,
  100% {
    transform-origin: top;
  }

  15% {
    transform: rotateZ(10deg);
  }

  30% {
    transform: rotateZ(-10deg);
  }

  45% {
    transform: rotateZ(5deg);
  }

  60% {
    transform: rotateZ(-5deg);
  }

  75% {
    transform: rotateZ(2deg);
  }
}
</style>
