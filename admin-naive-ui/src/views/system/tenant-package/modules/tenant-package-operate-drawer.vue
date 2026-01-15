<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useLoading } from '@sa/hooks';
import { fetchTenantPackageCreate, fetchTenantPackageUpdate, fetchMenuTenantPackageMenuTreeselect } from '@/service/api-gen';
import type { TenantPackageResponseDto, CreateTenantPackageRequestDto, UpdateTenantPackageRequestDto, MenuTreeResponseDto } from '@/service/api-gen/types';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import MenuTree from '@/components/custom/menu-tree.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'TenantPackageOperateDrawer',
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: TenantPackageResponseDto | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const menuTreeRef = ref<InstanceType<typeof MenuTree> | null>(null);

const menuOptions = ref<MenuTreeResponseDto[]>([]);

const { loading: menuLoading, startLoading: startMenuLoading, endLoading: stopMenuLoading } = useLoading();

const visible = defineModel<boolean>('visible', {
  default: false,
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { createRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.system.tenantPackage.addTenantPackage'),
    edit: $t('page.system.tenantPackage.editTenantPackage'),
  };
  return titles[props.operateType];
});

type Model = {
  packageId?: number;
  packageName: string;
  menuIds: number[];
  remark: string;
  menuCheckStrictly: boolean;
};

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    packageName: '',
    menuIds: [],
    remark: '',
    menuCheckStrictly: true,
  };
}

type RuleKey = Extract<keyof Model, 'packageId' | 'packageName'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  packageId: createRequiredRule($t('page.system.tenantPackage.form.packageName.invalid')),
  packageName: createRequiredRule($t('page.system.tenantPackage.form.packageName.required')),
};

async function handleUpdateModelWhenEdit() {
  menuOptions.value = [];
  model.menuIds = [];

  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    try {
      const { data } = await fetchMenuTenantPackageMenuTreeselect(0);
      if (!data) {
        return;
      }
      model.menuIds = data.checkedKeys;
      menuOptions.value = data.menus;
    } catch {
      // error handled by request interceptor
    }
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    startMenuLoading();
    Object.assign(model, { ...props.rowData, menuIds: [] });
    try {
      const { data } = await fetchMenuTenantPackageMenuTreeselect(model.packageId!);
      if (!data) {
        return;
      }
      model.menuIds = data.checkedKeys;
      menuOptions.value = data.menus;
    } catch {
      // error handled by request interceptor
    } finally {
      stopMenuLoading();
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { packageId, packageName, remark, menuCheckStrictly } = model;
  const menuIds = menuTreeRef.value?.getCheckedMenuIds() as number[] | undefined;
  // request
  try {
    if (props.operateType === 'add') {
      const createData: CreateTenantPackageRequestDto = {
        packageName,
        menuIds,
        remark,
        menuCheckStrictly,
      };
      await fetchTenantPackageCreate(createData);
    } else if (props.operateType === 'edit') {
      const updateData: UpdateTenantPackageRequestDto = {
        packageId: packageId!,
        packageName,
        menuIds,
        remark,
        menuCheckStrictly,
      };
      await fetchTenantPackageUpdate(updateData);
    }

    window.$message?.success($t('common.saveSuccess'));
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
  <NDrawer v-model:show="visible" :title="title" display-directive="show" :width="800" class="max-w-90%">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.system.tenantPackage.packageName')" path="packageName">
          <NInput
            v-model:value="model.packageName"
            :placeholder="$t('page.system.tenantPackage.form.packageName.required')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.tenantPackage.menuIds')" path="menuIds">
          <MenuTree
            v-if="visible"
            ref="menuTreeRef"
            v-model:checked-keys="model.menuIds"
            v-model:options="menuOptions"
            v-model:cascade="model.menuCheckStrictly"
            v-model:loading="menuLoading"
            :immediate="false"
          />
        </NFormItem>
        <NFormItem :label="$t('page.system.tenantPackage.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            :placeholder="$t('page.system.tenantPackage.form.remark.required')"
            type="textarea"
          />
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
