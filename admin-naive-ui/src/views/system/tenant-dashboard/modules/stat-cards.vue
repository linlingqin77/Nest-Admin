<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import { useThemeStore } from '@/store/modules/theme';

defineOptions({
  name: 'StatCards'
});

interface Props {
  stats?: Api.System.TenantDashboardStats | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  stats: null,
  loading: false
});

const themeStore = useThemeStore();

interface CardData {
  key: string;
  title: string;
  value: number;
  unit: string;
  color: {
    start: string;
    end: string;
  };
  icon: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'totalTenants',
    title: '租户总数',
    value: props.stats?.totalTenants ?? 0,
    unit: '',
    color: {
      start: '#ec4786',
      end: '#b955a4'
    },
    icon: 'material-symbols:business-outline'
  },
  {
    key: 'activeTenants',
    title: '活跃租户',
    value: props.stats?.activeTenants ?? 0,
    unit: '',
    color: {
      start: '#865ec0',
      end: '#5144b4'
    },
    icon: 'material-symbols:trending-up'
  },
  {
    key: 'newTenants',
    title: '本月新增',
    value: props.stats?.newTenants ?? 0,
    unit: '',
    color: {
      start: '#56cdf3',
      end: '#719de3'
    },
    icon: 'material-symbols:add-business-outline'
  },
  {
    key: 'totalUsers',
    title: '用户总数',
    value: props.stats?.totalUsers ?? 0,
    unit: '',
    color: {
      start: '#fcbc25',
      end: '#f68057'
    },
    icon: 'material-symbols:group-outline'
  },
  {
    key: 'onlineUsers',
    title: '在线用户',
    value: props.stats?.onlineUsers ?? 0,
    unit: '',
    color: {
      start: '#26deca',
      end: '#1abc9c'
    },
    icon: 'material-symbols:person-check-outline'
  },
  {
    key: 'todayLoginUsers',
    title: '今日登录',
    value: props.stats?.todayLoginUsers ?? 0,
    unit: '',
    color: {
      start: '#8e9dff',
      end: '#6366f1'
    },
    icon: 'material-symbols:login'
  },
  {
    key: 'totalStorageUsed',
    title: '存储使用',
    value: props.stats?.totalStorageUsed ?? 0,
    unit: 'MB',
    color: {
      start: '#f472b6',
      end: '#ec4899'
    },
    icon: 'material-symbols:cloud-outline'
  },
  {
    key: 'totalApiCalls',
    title: '今日API调用',
    value: props.stats?.totalApiCalls ?? 0,
    unit: '',
    color: {
      start: '#a78bfa',
      end: '#8b5cf6'
    },
    icon: 'material-symbols:api'
  }
]);

interface GradientBgProps {
  gradientColor: string;
}

const [DefineGradientBg, GradientBg] = createReusableTemplate<GradientBgProps>();

function getGradientColor(color: CardData['color']) {
  return `linear-gradient(to bottom right, ${color.start}, ${color.end})`;
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NSpin :show="loading">
      <!-- define component start: GradientBg -->
      <DefineGradientBg v-slot="{ $slots, gradientColor }">
        <div
          class="px-16px pb-4px pt-8px text-white"
          :style="{ backgroundImage: gradientColor, borderRadius: themeStore.themeRadius + 'px' }"
        >
          <component :is="$slots.default" />
        </div>
      </DefineGradientBg>
      <!-- define component end: GradientBg -->

      <NGrid cols="s:2 m:4 l:4 xl:8" responsive="screen" :x-gap="16" :y-gap="16">
        <NGi v-for="item in cardData" :key="item.key">
          <GradientBg :gradient-color="getGradientColor(item.color)" class="flex-1">
            <h3 class="text-14px">{{ item.title }}</h3>
            <div class="flex justify-between pt-12px">
              <SvgIcon :icon="item.icon" class="text-28px" />
              <CountTo
                :prefix="item.unit ? '' : ''"
                :suffix="item.unit"
                :start-value="0"
                :end-value="item.value"
                class="text-24px text-white dark:text-dark"
              />
            </div>
          </GradientBg>
        </NGi>
      </NGrid>
    </NSpin>
  </NCard>
</template>

<style scoped></style>
