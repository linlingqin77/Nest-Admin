<script setup lang="ts">
import { ref, watch } from 'vue';
import { fetchTemplateImportGroup } from '@/service/api-gen';
import type { ImportTemplateGroupDto } from '@/service/api-gen/types';
import { $t } from '@/locales';

defineOptions({
  name: 'TemplateImportDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const jsonContent = ref('');
const parseError = ref('');
const parsedData = ref<ImportTemplateGroupDto | null>(null);
const importing = ref(false);

function closeDrawer() {
  visible.value = false;
}

function handleJsonChange() {
  parseError.value = '';
  parsedData.value = null;

  if (!jsonContent.value.trim()) {
    return;
  }

  try {
    const data = JSON.parse(jsonContent.value);

    // 验证必要字段
    if (!data.name) {
      parseError.value = '缺少必要字段: name';
      return;
    }
    if (!data.templates || !Array.isArray(data.templates)) {
      parseError.value = '缺少必要字段: templates (数组)';
      return;
    }
    if (data.templates.length === 0) {
      parseError.value = '模板列表不能为空';
      return;
    }

    // 验证每个模板
    for (let i = 0; i < data.templates.length; i += 1) {
      const t = data.templates[i];
      if (!t.name || !t.fileName || !t.filePath || !t.content || !t.language) {
        parseError.value = `模板 ${i + 1} 缺少必要字段`;
        return;
      }
      if (!['typescript', 'vue', 'sql'].includes(t.language)) {
        parseError.value = `模板 ${i + 1} 的 language 必须是 typescript、vue 或 sql`;
        return;
      }
    }

    parsedData.value = data;
  } catch (e) {
    parseError.value = `JSON 格式错误: ${(e as Error).message}`;
  }
}

async function handleImport() {
  if (!parsedData.value) {
    window.$message?.warning('请先输入有效的 JSON 数据');
    return;
  }

  importing.value = true;
  try {
    await fetchTemplateImportGroup(parsedData.value);
    window.$message?.success('导入成功');
    closeDrawer();
    emit('submitted');
  } catch {
    // error handled by request interceptor
  } finally {
    importing.value = false;
  }
}

function handleFileUpload(options: { file: { file: File | null } }) {
  const file = options.file.file;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    jsonContent.value = e.target?.result as string;
    handleJsonChange();
  };
  reader.readAsText(file);
}

watch(visible, () => {
  if (visible.value) {
    jsonContent.value = '';
    parseError.value = '';
    parsedData.value = null;
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" title="导入模板组" display-directive="show" :width="600" class="max-w-90%">
    <NDrawerContent title="导入模板组" :native-scrollbar="false" closable>
      <NSpace vertical :size="16" class="w-full">
        <NAlert type="info" title="导入说明">
          <p class="m-0">请上传或粘贴模板组的 JSON 数据。JSON 格式示例：</p>
          <pre class="mt-8px rounded bg-gray-100 p-8px text-12px dark:bg-gray-800">
{
  "name": "模板组名称",
  "description": "描述",
  "templates": [
    {
      "name": "模板名称",
      "fileName": "${businessName}.ts",
      "filePath": "src/${moduleName}",
      "content": "模板内容",
      "language": "typescript",
      "sort": 0
    }
  ]
}</pre
          >
        </NAlert>

        <NUpload accept=".json" :max="1" :show-file-list="false" @change="handleFileUpload">
          <NButton secondary>
            <template #icon>
              <SvgIcon icon="material-symbols:upload-file" />
            </template>
            选择 JSON 文件
          </NButton>
        </NUpload>

        <NInput
          v-model:value="jsonContent"
          type="textarea"
          :rows="15"
          placeholder="或在此粘贴 JSON 内容..."
          @update:value="handleJsonChange"
        />

        <NAlert v-if="parseError" type="error" :title="parseError" />

        <NCard v-if="parsedData" title="解析结果" size="small">
          <NDescriptions :column="1" label-placement="left">
            <NDescriptionsItem label="模板组名称">{{ parsedData.name }}</NDescriptionsItem>
            <NDescriptionsItem label="描述">{{ parsedData.description || '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="模板数量">{{ parsedData.templates.length }}</NDescriptionsItem>
          </NDescriptions>
          <NDivider />
          <NTable :bordered="false" :single-line="false" size="small">
            <thead>
              <tr>
                <th>模板名称</th>
                <th>语言</th>
                <th>输出文件名</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, index) in parsedData.templates" :key="index">
                <td>{{ t.name }}</td>
                <td>{{ t.language }}</td>
                <td>{{ t.fileName }}</td>
              </tr>
            </tbody>
          </NTable>
        </NCard>
      </NSpace>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" :disabled="!parsedData" :loading="importing" @click="handleImport">导入</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
