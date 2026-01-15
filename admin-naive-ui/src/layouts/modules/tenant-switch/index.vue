<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  fetchGetTenantSelectList,
  fetchSwitchTenant,
  fetchRestoreTenant,
  fetchGetTenantSwitchStatus,
} from '@/service/api/system/tenant';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({
  name: 'TenantSwitch',
});

const authStore = useAuthStore();
const show = ref(false);
const loading = ref(false);
const switchLoading = ref(false);
const tenantList = ref<Api.System.TenantSelectItem[]>([]);
const switchStatus = ref<Api.System.TenantSwitchStatus | null>(null);

// Check if user is super admin (userId === 1)
const isSuperAdmin = computed(() => {
  return authStore.userInfo.user?.userId === 1;
});

// Current tenant display
const currentTenantName = computed(() => {
  if (switchStatus.value?.isSwitched) {
    return switchStatus.value.currentCompanyName || switchStatus.value.currentTenantId;
  }
  return null;
});

async function loadTenantList() {
  loading.value = true;
  try {
    const { data } = await fetchGetTenantSelectList();
    tenantList.value = data ?? [];
  } catch {
    // error handled by request interceptor
  } finally {
    loading.value = false;
  }
}

async function loadSwitchStatus() {
  try {
    const { data } = await fetchGetTenantSwitchStatus();
    switchStatus.value = data ?? null;
  } catch {
    // error handled by request interceptor
  }
}

async function handleSwitchTenant(tenantId: string) {
  switchLoading.value = true;
  try {
    const { data, error } = await fetchSwitchTenant(tenantId);
    if (!error && data) {
      window.$message?.success(`已切换到租户`);
      await loadSwitchStatus();
      show.value = false;
      // Reload page to refresh data
      window.location.reload();
    }
  } catch {
    // error handled by request interceptor
  } finally {
    switchLoading.value = false;
  }
}

async function handleRestoreTenant() {
  switchLoading.value = true;
  try {
    const { data, error } = await fetchRestoreTenant();
    if (!error && data) {
      window.$message?.success('已恢复到原租户');
      await loadSwitchStatus();
      // Reload page to refresh data
      window.location.reload();
    }
  } catch {
    // error handled by request interceptor
  } finally {
    switchLoading.value = false;
  }
}

function handlePopoverShow(visible: boolean) {
  if (visible) {
    loadTenantList();
  }
}

onMounted(() => {
  if (isSuperAdmin.value) {
    loadSwitchStatus();
  }
});
</script>

<template>
  <template v-if="isSuperAdmin">
    <!-- Show current switched tenant indicator -->
    <NTag
      v-if="switchStatus?.isSwitched"
      type="warning"
      closable
      class="mr-8px"
      @close="handleRestoreTenant"
    >
      <template #icon>
        <SvgIcon icon="material-symbols:swap-horiz" />
      </template>
      {{ currentTenantName }}
    </NTag>

    <!-- Tenant switch button -->
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
            <NButton quaternary class="h-36px text-icon" :focusable="false">
              <div class="flex-center gap-8px">
                <SvgIcon icon="material-symbols:business-outline" class="text-18px" />
              </div>
            </NButton>
          </template>
          切换租户
        </NTooltip>
      </template>
      <NCard
        size="small"
        :bordered="false"
        class="w-300px"
        header-class="p-0"
        :segmented="{ content: true }"
      >
        <template #header>
          <div class="flex items-center gap-8px">
            <SvgIcon icon="material-symbols:swap-horiz" />
            <span>切换租户</span>
          </div>
        </template>
        <NSpin :show="loading || switchLoading">
          <NScrollbar class="max-h-300px">
            <template v-if="tenantList.length">
              <div
                v-for="tenant in tenantList"
                :key="tenant.tenantId"
                class="tenant-item cursor-pointer p-12px hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                :class="{
                  'bg-primary-50 dark:bg-primary-900': switchStatus?.currentTenantId === tenant.tenantId,
                }"
                @click="handleSwitchTenant(tenant.tenantId)"
              >
                <div class="flex items-center gap-8px">
                  <SvgIcon icon="material-symbols:business-outline" class="text-16px text-gray-500" />
                  <div>
                    <div class="font-medium text-14px">{{ tenant.companyName }}</div>
                    <div class="text-12px text-gray-400">{{ tenant.tenantId }}</div>
                  </div>
                </div>
                <NTag v-if="tenant.status === '0'" type="success" size="tiny">正常</NTag>
                <NTag v-else type="error" size="tiny">停用</NTag>
              </div>
            </template>
            <NEmpty v-else class="h-100px flex-center" description="暂无可切换的租户" />
          </NScrollbar>
        </NSpin>
        <template v-if="switchStatus?.isSwitched" #footer>
          <div class="flex items-center justify-center">
            <NButton type="warning" text :loading="switchLoading" @click="handleRestoreTenant">
              <template #icon>
                <SvgIcon icon="material-symbols:undo" />
              </template>
              恢复原租户
            </NButton>
          </div>
        </template>
      </NCard>
    </NPopover>
  </template>
</template>

<style scoped>
.tenant-item {
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--n-border-color);
}

.tenant-item:last-child {
  border-bottom: none;
}
</style>
