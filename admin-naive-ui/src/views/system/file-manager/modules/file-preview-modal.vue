<script setup lang="ts">
import { computed, ref } from 'vue';
import { NButton, NCard, NImage, NModal, NSpace } from 'naive-ui';

const visible = ref(false);
const fileData = ref<any>(null);

const isImage = computed(() => {
  if (!fileData.value?.ext) return false;
  // 支持带点号和不带点号的扩展名
  const ext = fileData.value.ext.toLowerCase().replace('.', '');
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
  return imageExts.includes(ext);
});

const isPdf = computed(() => {
  if (!fileData.value?.ext) return false;
  const ext = fileData.value.ext.toLowerCase().replace('.', '');
  return ext === 'pdf';
});

const isVideo = computed(() => {
  if (!fileData.value?.ext) return false;
  const ext = fileData.value.ext.toLowerCase().replace('.', '');
  const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv'];
  return videoExts.includes(ext);
});

const isText = computed(() => {
  if (!fileData.value?.ext) return false;
  const ext = fileData.value.ext.toLowerCase().replace('.', '');
  const textExts = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'];
  return textExts.includes(ext);
});

function openModal(data: any) {
  fileData.value = data;
  visible.value = true;
}

function handleDownload() {
  window.open(fileData.value.url, '_blank');
}

function handleClose() {
  visible.value = false;
  fileData.value = null;
}

defineExpose({
  openModal
});
</script>

<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="`预览 - ${fileData?.fileName || ''}`"
    class="w-800px"
    @after-leave="handleClose"
  >
    <div v-if="fileData" class="preview-container">
      <!-- 图片预览 -->
      <div v-if="isImage" class="text-center">
        <NImage :src="fileData.url" :alt="fileData.fileName" class="max-h-600px max-w-full" />
      </div>

      <!-- PDF预览 -->
      <div v-else-if="isPdf" class="h-600px">
        <iframe :src="fileData.url" class="h-full w-full border-none" />
      </div>

      <!-- 视频预览 -->
      <div v-else-if="isVideo" class="text-center">
        <video :src="fileData.url" controls class="max-h-600px max-w-full" />
      </div>

      <!-- 文本预览 -->
      <div v-else-if="isText" class="h-600px overflow-auto">
        <iframe :src="fileData.url" class="h-full w-full border-none" />
      </div>

      <!-- 不支持预览 -->
      <div v-else class="py-20 text-center">
        <icon-material-symbols-draft-outline class="mb-4 text-64px text-gray" />
        <div class="text-gray">该文件类型暂不支持预览</div>
        <NButton type="primary" class="mt-4" @click="handleDownload">下载文件</NButton>
      </div>
    </div>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleClose">关闭</NButton>
        <NButton type="primary" @click="handleDownload">
          <template #icon>
            <icon-material-symbols-download />
          </template>
          下载
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.preview-container {
  min-height: 200px;
}
</style>
