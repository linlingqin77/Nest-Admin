<script setup lang="ts">
import { ref, useAttrs } from 'vue';
import type { SelectProps } from 'naive-ui';
import { useLoading } from '@sa/hooks';
import { fetchRoleOptionselect } from '@/service/api-gen';
import type { RoleResponseDto } from '@/service/api-gen/types';

defineOptions({
  name: 'RoleSelect',
});

interface Props {
  [key: string]: any;
}

defineProps<Props>();

const value = defineModel<CommonType.IdType[] | null>('value', { required: false });

const attrs: SelectProps = useAttrs();

const { loading: roleLoading, startLoading: startRoleLoading, endLoading: endRoleLoading } = useLoading();

/** the enabled role options */
const roleOptions = ref<CommonType.Option<CommonType.IdType>[]>([]);

async function getRoleOptions() {
  startRoleLoading();
  try {
    const { data } = await fetchRoleOptionselect();
    const roles = data as RoleResponseDto[];
    roleOptions.value = roles.map((item) => ({
      label: item.roleName!,
      value: item.roleId!,
    }));
  } catch {
    // error handled by request interceptor
  }
  endRoleLoading();
}

getRoleOptions();
</script>

<template>
  <NSelect
    v-model:value="value"
    :loading="roleLoading"
    :options="roleOptions"
    v-bind="attrs"
    placeholder="请选择角色"
  />
</template>

<style scoped></style>
