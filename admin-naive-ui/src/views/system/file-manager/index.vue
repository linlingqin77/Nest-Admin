<template>
  <div class="file-manager-wrapper">
    <!-- 布局容器 -->
    <n-layout has-sider position="absolute" style="top: 0; bottom: 0">
      <!-- 侧边栏 -->
      <n-layout-sider v-model:collapsed="sidebarCollapsed" bordered :collapsed-width="isMobile ? 0 : 80"
        :width="isMobile ? '80%' : 280" show-trigger="bar" collapse-mode="width" :native-scrollbar="false"
        :default-collapsed="isMobile">
        <sidebar-menu ref="sidebarMenuRef" @primary-menu-change="handlePrimaryMenuChange"
          @secondary-menu-change="handleSecondaryMenuChange" />
      </n-layout-sider>

      <!-- 主内容区 -->
      <n-layout>
        <!-- 头部：面包屑 + 工具栏 -->
        <n-layout-header bordered>
          <div class="header-container">
            <!-- 面包屑导航 -->
            <div class="breadcrumb-container">
              <n-breadcrumb>
                <n-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.id"
                  @click="navigateToBreadcrumb(index)" :clickable="index < breadcrumbs.length - 1"
                  class="cursor-pointer">
                  {{ item.name }}
                </n-breadcrumb-item>
              </n-breadcrumb>
            </div>

            <!-- 工具栏 -->
            <div class="toolbar-container">
              <n-space align="center" style="width: 100%" :size="isMobile ? 4 : 12">
                <!-- 移动端菜单按钮 -->
                <n-button v-if="isMobile" @click="sidebarCollapsed = !sidebarCollapsed" size="small" secondary>
                  <template #icon>
                    <icon-carbon:menu />
                  </template>
                </n-button>

                <!-- 返回按钮 -->
                <n-button @click="goBack" :disabled="breadcrumbs.length === 1" size="small" secondary>
                  <template #icon>
                    <icon-carbon:arrow-left />
                  </template>
                </n-button>

                <!-- 新建文件夹 -->
                <n-button type="primary" :round="true" @click="handleCreateFolder" size="small">
                  <template #icon>
                    <icon-carbon:folder-add />
                  </template>
                  <span v-if="!isMobile">新建文件夹</span>
                </n-button>

                <!-- 上传文件 -->
                <n-upload :show-file-list="false" multiple :max="20" @change="handleUploadChange"
                  :custom-request="() => { }">
                  <n-button type="primary" :round="true" size="small">
                    <template #icon>
                      <icon-carbon:upload />
                    </template>
                    <span v-if="!isMobile">上传文件</span>
                  </n-button>
                </n-upload>

                <div v-if="!isMobile" class="flex-1" />

                <!-- 批量操作按钮 -->
                <template v-if="selectedItems.length > 0">
                  <span v-if="!isMobile" class="text-sm font-bold mr-2"> 已选择 {{ selectedItems.length }} 项 </span>
                  <n-button size="small" @click="selectedItems = []">
                    <template v-if="isMobile" #icon>
                      <icon-carbon:close />
                    </template>
                    <span v-if="!isMobile">取消</span>
                  </n-button>
                  <n-button v-if="!isMobile" size="small" @click="handleBatchMove">移动</n-button>
                  <n-button v-if="!isMobile" size="small" @click="handleBatchShare">分享</n-button>
                  <n-button size="small" type="error" @click="handleBatchDelete">
                    <template v-if="isMobile" #icon>
                      <icon-carbon:trash-can />
                    </template>
                    <span v-if="!isMobile">删除</span>
                  </n-button>
                </template>

                <!-- 视图切换 -->
                <n-button-group v-if="!isMobile" size="small">
                  <n-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">
                    <template #icon>
                      <icon-carbon:list />
                    </template>
                  </n-button>
                  <n-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
                    <template #icon>
                      <icon-carbon:grid />
                    </template>
                  </n-button>
                </n-button-group>

                <!-- 搜索框 -->
                <n-input v-if="!isMobile || showSearch" v-model:value="searchKeyword" placeholder="搜索文件"
                  :style="{ width: isMobile ? '100%' : `${SEARCH_WIDTH}px` }" :round="true" clearable
                  @blur="isMobile && !searchKeyword ? showSearch = false : null">
                  <template #prefix>
                    <icon-carbon:search />
                  </template>
                </n-input>

                <!-- 移动端搜索按钮 -->
                <n-button v-if="isMobile && !showSearch" size="small" @click="showSearch = true">
                  <template #icon>
                    <icon-carbon:search />
                  </template>
                </n-button>
              </n-space>
            </div>
          </div>
        </n-layout-header>

        <!-- 内容区 -->
        <n-layout-content :content-style="isMobile ? 'padding: 12px;' : 'padding: 24px;'">
          <!-- 空状态 -->
          <div v-if="!loading && fileList.length === 0" class="empty-state">
            <icon-carbon:folder :class="isMobile ? 'text-60px' : 'text-100px'" class="text-gray-300" />
            <div :class="isMobile ? 'text-14px' : 'text-16px'" class="text-gray mt-4">当前文件夹为空</div>
            <div class="text-12px text-gray-400 mt-2">拖拽文件到此处或点击上传按钮</div>
          </div>

          <!-- 列表视图 -->
          <file-list v-else-if="viewMode === 'list'" :file-list="fileList" :loading="loading"
            v-model:checked-keys="selectedItems" @itemClick="handleItemClick" @itemDblClick="handleDoubleClick"
            @contextMenu="handleContextMenu" />

          <!-- 网格视图 -->
          <file-grid v-else :file-list="fileList" :loading="loading" v-model:checked-keys="selectedItems"
            @itemClick="handleItemClick" @itemDblClick="handleDoubleClick" @contextMenu="handleContextMenu"
            @fileDrop="handleFileDrop" />

          <!-- 分页 -->
          <div v-if="fileList.length > 0" :class="isMobile ? 'flex justify-center mt-4' : 'flex justify-end mt-4'">
            <n-pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount" :page-sizes="[20, 50, 100]" :show-size-picker="!isMobile"
              :size="isMobile ? 'small' : 'medium'" @update:page="loadFileList" @update:page-size="loadFileList" />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>

    <!-- 右键菜单 -->
    <n-dropdown :show="contextMenuShow" :options="contextMenuOptions" :x="contextMenuX" :y="contextMenuY"
      placement="bottom-start" @clickoutside="contextMenuShow = false" @select="handleContextMenuSelect" />

    <!-- 全局拖拽上传遮罩 -->
    <drag-upload-overlay @upload="handleGlobalUpload" />

    <!-- 上传进度面板 -->
    <upload-panel v-if="showUploadPanel" :tasks="uploadTasks" @close="showUploadPanel = false"
      @pause="handleUploadPause" @resume="handleUploadResume" @cancel="handleUploadCancel" @retry="handleUploadRetry" />

    <!-- 模态框 -->
    <folder-modal ref="folderModalRef" @success="refreshList" />
    <file-preview-modal ref="previewModalRef" />
    <file-share-modal ref="shareModalRef" />
    <move-file-modal ref="moveFileModalRef" @success="refreshList" />
    <batch-share-modal ref="batchShareModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, h } from 'vue';
import { useWindowSize } from '@vueuse/core';
import {
  NCard,
  NBreadcrumb,
  NBreadcrumbItem,
  NSpace,
  NButton,
  NInput,
  NSelect,
  NDataTable,
  NGrid,
  NGi,
  NCheckbox,
  NDropdown,
  NIcon,
  NUpload,
  useMessage,
  useDialog,
  NPagination,
  NRadioGroup,
  NRadio,
  NEllipsis,
  NImage,
  NTooltip,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NButtonGroup
} from 'naive-ui';
import type { DataTableColumns, DropdownOption } from 'naive-ui';
import {
  fetchGetFolderTree,
  fetchGetFileList,
  fetchCreateFolder,
  fetchDeleteFolder,
  fetchBatchDeleteFiles,
  fetchRenameFile,
  fetchUploadFile,
  fetchMoveFiles
} from '@/service/api';
import FolderModal from './modules/folder-modal.vue';
import FilePreviewModal from './modules/file-preview-modal.vue';
import FileShareModal from './modules/file-share-modal.vue';
import MoveFileModal from './modules/move-file-modal.vue';
import BatchShareModal from './modules/batch-share-modal.vue';
import SidebarMenu from './components/sidebar-menu.vue';
import FileList from './components/file-list.vue';
import FileGrid from './components/file-grid.vue';
import DragUploadOverlay from '@/components/drag-upload-overlay/index.vue';
import UploadPanel from '@/components/upload-panel/index.vue';
import type { UploadTask } from '@/components/upload-panel/index.vue';
import type { FileItem as FileListItem } from './components/file-list.vue';
import { useFileDrag, useDropTarget } from './hooks/use-file-drag';
import type { DragItem } from './hooks/use-file-drag';
import {
  FILE_TYPE_CATEGORIES,
  getFileTypeCategory,
  getFileIcon,
  HEADER_HEIGHT,
  TOOLBAR_HEIGHT,
  BREADCRUMB_HEIGHT,
  BUTTON_BORDER_RADIUS,
  SEARCH_WIDTH,
  SEARCH_BORDER_RADIUS
} from './constants';
import { formatFileSize as formatSize, formatDate as formatDateTime } from './constants';

defineOptions({
  name: 'SystemFileManager'
});

const message = useMessage();
const dialog = useDialog();

// 响应式相关
const { width: windowWidth } = useWindowSize();
const isMobile = computed(() => windowWidth.value < 768);
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024);
const sidebarCollapsed = ref(windowWidth.value < 768); // 移动端默认折叠
const showSearch = ref(false);

type FileTypeCategory = keyof typeof FILE_TYPE_CATEGORIES;

// 当前激活的文件类型筛选
const activeFileType = ref<FileTypeCategory>('all');

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid');

// 当前文件夹路径
const currentFolderId = ref(0);
const breadcrumbs = ref<Array<{ id: number; name: string }>>([{ id: 0, name: '全部文件' }]);

// 文件和文件夹数据
interface FileItem {
  type: 'folder' | 'file';
  id: string | number;
  name: string;
  size?: number;
  createTime?: string;
  thumbnail?: string;
  ext?: string;
  storageType?: string;
  url?: string;
}

const fileList = ref<FileItem[]>([]);
const loading = ref(false);
const selectedItems = ref<(string | number)[]>([]);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0
});

// 右键菜单
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const contextMenuShow = ref(false);
const contextMenuItem = ref<FileItem | null>(null);

// 拖拽上传
const dragOver = ref(false);

// 拖拽到文件夹的目标ID
const dragTargetFolderId = ref<number | null>(null);

// Modals
const folderModalRef = ref();
const previewModalRef = ref();
const shareModalRef = ref();
const moveFileModalRef = ref();
const batchShareModalRef = ref();
const sidebarMenuRef = ref();

// 文件夹树数据
const allFolders = ref<any[]>([]);

// 上传进度面板
const showUploadPanel = ref(false);
const uploadTasks = ref<UploadTask[]>([]);

// 搜索关键词
const searchKeyword = ref('');

// 拖拽相关
const selectedDragItems = computed<DragItem[]>(() => {
  return fileList.value
    .filter((item) => selectedItems.value.includes(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      thumbnail: item.thumbnail
    }));
});

const { isDragging, dragHandlers } = useFileDrag(selectedDragItems);

// 加载文件夹树
async function loadFolderTree() {
  try {
    const { data } = await fetchGetFolderTree();
    allFolders.value = data || [];
  } catch (error) {
    message.error('加载文件夹失败');
  }
}

// 加载文件列表
async function loadFileList() {
  loading.value = true;
  try {
    // 如果是按文件类型筛选，则不显示文件夹，且不限制文件夹ID（全局搜索）
    const isTypeFilter = activeFileType.value !== 'all';
    const currentFolderChildren = isTypeFilter
      ? []
      : allFolders.value.filter((f) => f.parentId === currentFolderId.value);

    // 构建查询参数
    const queryParams: any = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    };

    // 如果不是类型筛选，传递当前文件夹ID（包括根目录folderId=0）
    if (!isTypeFilter) {
      queryParams.folderId = currentFolderId.value;
    }

    // 如果是按类型筛选（且不是全部），传递扩展名列表
    if (isTypeFilter && activeFileType.value !== 'other') {
      const exts = FILE_TYPE_CATEGORIES[activeFileType.value].exts;
      if (exts.length > 0) {
        queryParams.exts = exts.join(','); // 后端需要支持逗号分隔的扩展名
      }
    }

    const { data: filesData } = await fetchGetFileList(queryParams);

    const folderItems: FileItem[] = currentFolderChildren.map((f: any) => ({
      type: 'folder' as const,
      id: f.folderId,
      name: f.folderName,
      createTime: f.createTime
    }));

    let fileItems: FileItem[] = (filesData?.rows || []).map((f: any) => ({
      type: 'file' as const,
      id: f.uploadId,
      name: f.fileName,
      size: f.size, // 修改：后端返回的字段是size，不是fileSize
      createTime: f.createTime,
      thumbnail: f.thumbnail,
      ext: f.ext,
      storageType: f.storageType,
      url: f.url
    }));

    // 如果是"其他"类型，前端再过滤一次
    if (activeFileType.value === 'other') {
      fileItems = fileItems.filter((f) => {
        const category = getFileTypeCategory(f.ext || '');
        return category === 'other';
      });
    }

    fileList.value = [...folderItems, ...fileItems];
    pagination.itemCount = (filesData?.total || 0) + folderItems.length;
  } finally {
    loading.value = false;
  }
}

// 切换文件类型筛选
function handleFileTypeChange(type: FileTypeCategory) {
  activeFileType.value = type;
  pagination.page = 1;
  selectedItems.value = [];

  // 如果切换到文件类型筛选，返回根目录
  if (type !== 'all') {
    currentFolderId.value = 0;
    breadcrumbs.value = [{ id: 0, name: '全部文件' }];
  }

  loadFileList();
}

// 进入文件夹
function enterFolder(folderId: number, folderName: string) {
  // 进入文件夹时重置为"全部文件"筛选
  activeFileType.value = 'all';
  currentFolderId.value = folderId;
  breadcrumbs.value.push({ id: folderId, name: folderName });
  pagination.page = 1;
  selectedItems.value = [];
  loadFileList();
}

// 面包屑导航
function navigateToBreadcrumb(index: number) {
  activeFileType.value = 'all';
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1);
  currentFolderId.value = breadcrumbs.value[index].id;
  pagination.page = 1;
  selectedItems.value = [];
  loadFileList();
}

// 返回上一级
function goBack() {
  if (breadcrumbs.value.length > 1) {
    activeFileType.value = 'all';
    breadcrumbs.value.pop();
    currentFolderId.value = breadcrumbs.value[breadcrumbs.value.length - 1].id;
    pagination.page = 1;
    selectedItems.value = [];
    loadFileList();
  }
}

// 处理文件卡片点击（单击选中/取消选中）
function handleCardClick(item: FileItem, event: MouseEvent) {
  // 如果点击的是checkbox，不处理（让checkbox自己的事件处理）
  if ((event.target as HTMLElement).closest('.file-checkbox')) {
    return;
  }

  // 单击切换选中状态
  const index = selectedItems.value.indexOf(item.id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item.id);
  }
}

// 处理checkbox变化
function handleCheckboxChange(itemId: string | number, checked: boolean) {
  if (checked) {
    if (!selectedItems.value.includes(itemId)) {
      selectedItems.value.push(itemId);
    }
  } else {
    const index = selectedItems.value.indexOf(itemId);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    }
  }
}

// 处理文件项点击（供FileList和FileGrid组件使用）
function handleItemClick(item: FileItem) {
  // 单击直接打开（文件夹进入，文件预览）
  if (item.type === 'folder') {
    enterFolder(item.id as number, item.name);
  } else {
    previewModalRef.value?.openModal({
      fileName: item.name,
      url: item.url,
      ext: item.ext // 传递扩展名
    });
  }
}

// 双击项目（保持与单击相同的行为以保证兼容性）
function handleDoubleClick(item: FileItem) {
  console.log('handleDoubleClick called:', item.name, item.type);
  if (item.type === 'folder') {
    console.log('Entering folder:', item.id, item.name);
    enterFolder(item.id as number, item.name);
  } else {
    previewModalRef.value?.openModal({
      fileName: item.name,
      url: item.url,
      ext: item.ext // 传递扩展名
    });
  }
}

// 右键菜单
function handleContextMenu(e: MouseEvent, item: FileItem) {
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuItem.value = item;
  contextMenuShow.value = true;
}

const contextMenuOptions = computed<DropdownOption[]>(() => {
  if (!contextMenuItem.value) return [];

  const item = contextMenuItem.value;
  const options: DropdownOption[] = [];

  if (item.type === 'folder') {
    options.push({ label: '打开', key: 'open' }, { label: '重命名', key: 'rename' }, { label: '删除', key: 'delete' });
  } else {
    options.push(
      { label: '预览', key: 'preview' },
      { label: '下载', key: 'download' },
      { label: '重命名', key: 'rename' },
      { label: '移动', key: 'move' },
      { label: '分享', key: 'share' },
      { label: '删除', key: 'delete' }
    );
  }

  return options;
});

function handleContextMenuSelect(key: string) {
  contextMenuShow.value = false;
  const item = contextMenuItem.value;
  if (!item) return;

  switch (key) {
    case 'open':
      if (item.type === 'folder') {
        enterFolder(item.id as number, item.name);
      }
      break;
    case 'preview':
      previewModalRef.value?.openModal({
        fileName: item.name,
        url: item.url,
        ext: item.ext // 传递扩展名
      });
      break;
    case 'download':
      window.open(item.url, '_blank');
      break;
    case 'rename':
      handleRename(item);
      break;
    case 'move':
      if (item.type === 'file') {
        moveFileModalRef.value?.openModal([item.id as string]);
      }
      break;
    case 'share':
      shareModalRef.value?.openModal({ uploadId: item.id, fileName: item.name });
      break;
    case 'delete':
      handleDelete(item);
      break;
  }
}

// 重命名
function handleRename(item: FileItem) {
  const inputValue = ref(item.name);

  dialog.create({
    title: '重命名',
    content: () =>
      h(NInput, {
        value: inputValue.value,
        'onUpdate:value': (v: string) => {
          inputValue.value = v;
        },
        placeholder: '请输入新名称',
        autofocus: true
      }),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const newName = inputValue.value?.trim();

      if (!newName) {
        message.warning('名称不能为空');
        return false;
      }

      try {
        if (item.type === 'folder') {
          message.info('文件夹重命名功能待实现');
        } else {
          await fetchRenameFile({
            uploadId: item.id as string,
            newFileName: newName
          });
          message.success('重命名成功');
          loadFileList();
        }
      } catch (error) {
        message.error('重命名失败');
        return false;
      }
    }
  });
}

// 删除
function handleDelete(item: FileItem) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 "${item.name}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        if (item.type === 'folder') {
          await fetchDeleteFolder(item.id as number);
        } else {
          await fetchBatchDeleteFiles([item.id as string]);
        }
        message.success('删除成功');
        await loadFolderTree();
        await loadFileList();
      } catch (error: any) {
        message.error(error?.message || '删除失败');
      }
    }
  });
}

// 批量删除
function handleBatchDelete() {
  if (selectedItems.value.length === 0) {
    message.warning('请选择要删除的项目');
    return;
  }

  const fileIds = selectedItems.value.filter((id) => typeof id === 'string');
  const folderIds = selectedItems.value.filter((id) => typeof id === 'number');

  dialog.warning({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedItems.value.length} 个项目吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const errors: string[] = [];

        // 删除文件
        if (fileIds.length > 0) {
          try {
            await fetchBatchDeleteFiles(fileIds as string[]);
          } catch (e: any) {
            errors.push(e?.message || '删除文件失败');
          }
        }

        // 逐个删除文件夹（因为可能有不同的错误）
        for (const folderId of folderIds) {
          try {
            await fetchDeleteFolder(folderId as number);
          } catch (e: any) {
            errors.push(e?.message || `删除文件夹${folderId}失败`);
          }
        }

        if (errors.length > 0) {
          message.error(errors.join('; '));
        } else {
          message.success('删除成功');
        }

        selectedItems.value = [];
        await loadFolderTree();
        await loadFileList();
      } catch (error: any) {
        message.error(error?.message || '删除失败');
      }
    }
  });
}

function handleBatchMove() {
  if (selectedItems.value.length === 0) {
    message.warning('请选择要移动的文件');
    return;
  }

  const fileIds = selectedItems.value.filter((id) => typeof id === 'string');
  if (fileIds.length === 0) {
    message.warning('只能移动文件，不能移动文件夹');
    return;
  }

  moveFileModalRef.value?.openModal(fileIds as string[]);
}

function handleBatchShare() {
  if (selectedItems.value.length === 0) {
    message.warning('请选择要分享的文件');
    return;
  }

  const fileIds = selectedItems.value.filter((id) => typeof id === 'string');
  if (fileIds.length === 0) {
    message.warning('只能分享文件，不能分享文件夹');
    return;
  }

  batchShareModalRef.value?.openModal(fileIds as string[]);
}

async function handleBatchDownload() {
  if (selectedItems.value.length === 0) {
    message.warning('请选择要下载的文件');
    return;
  }

  message.info('批量下载功能开发中...');
}

// 拖拽上传
function handleDrop(e: DragEvent) {
  e.preventDefault();
  dragOver.value = false;

  const files = Array.from(e.dataTransfer?.files || []);
  if (files.length > 0) {
    handleUploadFiles(files);
  }
}

async function handleUploadFiles(files: File[]) {
  if (files.length === 0) return;

  const uploadPromises = files.map(async (file) => {
    try {
      await fetchUploadFile(file, currentFolderId.value === 0 ? undefined : currentFolderId.value);
      return { file, success: true };
    } catch (error: any) {
      // 提取错误消息
      const errorMsg = error?.response?.data?.msg || error?.message || '上传失败';
      return { file, success: false, error: errorMsg };
    }
  });

  try {
    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;
    const failedFiles = results.filter((r) => !r.success);

    if (failedCount === 0) {
      message.success(`上传成功 ${successCount} 个文件`);
    } else if (successCount === 0) {
      // 显示第一个错误的详细信息
      const firstError = failedFiles[0]?.error || '上传失败';
      message.error(failedCount > 1 ? `上传失败 ${failedCount} 个文件：${firstError}` : firstError);
    } else {
      message.warning(`上传完成：成功 ${successCount} 个，失败 ${failedCount} 个`);
    }

    // 只要有成功的就刷新列表
    if (successCount > 0) {
      loadFileList();
    }
  } catch (error) {
    message.error('上传过程发生错误');
  }
}

function handleUploadChange(options: any) {
  const files = options.fileList.map((f: any) => f.file).filter(Boolean);
  handleUploadFiles(files);
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

// 侧边栏菜单变化处理
function handlePrimaryMenuChange(key: string) {
  console.log('Primary menu changed:', key);
  // 处理一级菜单变化（分享、回收站等）
  if (key === 'share') {
    message.info('我的分享功能开发中...');
  } else if (key === 'recycle') {
    message.info('回收站功能开发中...');
  }
}

function handleSecondaryMenuChange(key: string) {
  console.log('Secondary menu changed:', key);
  // 处理二级菜单变化（文件类型筛选）
  if (key === 'all-files') {
    handleFileTypeChange('all');
  } else if (key === 'recent') {
    message.info('最近使用功能开发中...');
  } else {
    // 文件类型筛选
    handleFileTypeChange(key as FileTypeCategory);
  }
}

// 上传面板操作
function handleUploadPause(taskId: string) {
  console.log('Pause upload:', taskId);
  message.info('暂停上传功能开发中...');
}

function handleUploadResume(taskId: string) {
  console.log('Resume upload:', taskId);
  message.info('继续上传功能开发中...');
}

function handleUploadCancel(taskId: string) {
  const index = uploadTasks.value.findIndex((t) => t.id === taskId);
  if (index > -1) {
    uploadTasks.value.splice(index, 1);
  }
}

function handleUploadRetry(taskId: string) {
  console.log('Retry upload:', taskId);
  message.info('重试上传功能开发中...');
}

// 全局拖拽上传处理
function handleGlobalUpload(files: File[]) {
  handleUploadFiles(files);
}

// 格式化原始文件名（显示时间+随机数）
function formatOriginalFileName(newFileName: string): string {
  if (!newFileName) return '-';

  // 提取时间戳部分（假设格式为: name_timestamp.ext）
  const parts = newFileName.split('_');
  if (parts.length < 2) return newFileName;

  const timestampPart = parts[parts.length - 1];
  const timestamp = timestampPart.split('.')[0];

  if (timestamp && /^\d{13}$/.test(timestamp)) {
    const date = new Date(parseInt(timestamp));
    const dateStr = date
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      .replace(/\//g, '-');

    // 生成随机数（取时间戳的后4位）
    const random = timestamp.slice(-4);
    return `${dateStr}_${random}`;
  }

  return newFileName;
}

// 表格列定义
const columns: DataTableColumns<FileItem> = [
  {
    type: 'selection'
  },
  {
    title: '文件名',
    key: 'name',
    ellipsis: { tooltip: true },
    render: (row) => {
      return h(
        'div',
        {
          class: 'flex items-center gap-2 cursor-pointer hover:text-primary',
          onClick: () => handleDoubleClick(row),
          onContextmenu: (e: MouseEvent) => handleContextMenu(e, row)
        },
        [
          h('icon-' + (row.type === 'folder' ? 'material-symbols:folder' : 'material-symbols:draft-outline'), {
            class: 'text-24px',
            style: { color: row.type === 'folder' ? '#ffc107' : '#666' }
          }),
          h(NEllipsis, { style: { maxWidth: '300px' } }, { default: () => row.name })
        ]
      );
    }
  },
  {
    title: '大小',
    key: 'size',
    width: 120,
    render: (row) => (row.type === 'file' && row.size ? formatFileSize(row.size) : '-')
  },
  {
    title: '修改时间',
    key: 'createTime',
    width: 180,
    render: (row) => formatDate(row.createTime || '')
  }
];

// 新建文件夹
function handleCreateFolder() {
  folderModalRef.value?.openModal(currentFolderId.value);
}

// 刷新列表
async function refreshList() {
  await loadFolderTree();
  loadFileList();
}

// 文件拖拽到文件夹（从FileGrid组件触发）
async function handleFileDrop(fileId: string | number, targetFolderId: string | number) {
  try {
    console.log('Moving file:', fileId, 'to folder:', targetFolderId);
    console.log('Current folder:', currentFolderId.value);

    const result = await fetchMoveFiles({
      uploadIds: [String(fileId)],
      targetFolderId: Number(targetFolderId)
    });

    console.log('Move result:', result);
    message.success('移动成功');

    // 刷新文件夹树和文件列表
    await loadFolderTree();
    await loadFileList();
  } catch (error) {
    console.error('Move error:', error);
    message.error('移动失败: ' + ((error as any)?.message || '未知错误'));
  }
}

// 文件拖拽到文件夹（旧版本，保留兼容）
function handleFileDragStart(item: FileItem, e: DragEvent) {
  if (item.type === 'folder') return; // 文件夹不能拖拽
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('fileId', String(item.id));
}

function handleFolderDragOver(folderId: number, e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
  dragTargetFolderId.value = folderId;
}

function handleFolderDragLeave() {
  dragTargetFolderId.value = null;
}

async function handleFolderDrop(targetFolderId: number, e: DragEvent) {
  e.preventDefault();
  dragTargetFolderId.value = null;

  const fileId = e.dataTransfer!.getData('fileId');
  if (!fileId) return;

  try {
    await fetchMoveFiles({
      uploadIds: [fileId],
      targetFolderId
    });
    message.success('移动成功');
    loadFileList();
  } catch (error) {
    message.error('移动失败');
  }
}

// 阻止浏览器默认的拖拽行为（防止拖拽文件时打开文件）
function preventDefaultDrag(e: DragEvent) {
  e.preventDefault();
}

// 全局drop事件处理，确保文件上传正常工作
function handleGlobalDrop(e: DragEvent) {
  // 检查是否是外部文件拖入（不是内部文件拖动）
  const hasFiles = e.dataTransfer?.types.includes('Files');
  const isInternalDrag = e.dataTransfer?.types.includes('fileid');

  if (hasFiles && !isInternalDrag) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    console.log('Global drop handler - files:', files);
    if (files.length > 0) {
      handleGlobalUpload(files);
    }
  }
}

onMounted(async () => {
  await loadFolderTree();
  loadFileList();

  // 全局阻止dragover默认行为，防止浏览器打开文件
  window.addEventListener('dragover', preventDefaultDrag);
  // 全局drop处理，确保文件上传
  window.addEventListener('drop', handleGlobalDrop);
});

onUnmounted(() => {
  window.removeEventListener('dragover', preventDefaultDrag);
  window.removeEventListener('drop', handleGlobalDrop);
});
</script>

<style scoped lang="scss">
.file-manager-wrapper {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.header-container {
  display: flex;
  flex-direction: column;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 24px;
  border-bottom: 1px solid var(--n-divider-color);
  background: var(--n-color);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE/Edge */
}

.breadcrumb-container::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari */
}

.toolbar-container {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 12px 24px;
  background: var(--n-color);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.toolbar-container::-webkit-scrollbar {
  display: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
}

.flex-1 {
  flex: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .breadcrumb-container {
    padding: 6px 12px;
    min-height: 36px;
  }

  .toolbar-container {
    padding: 8px 12px;
    min-height: auto;
    flex-wrap: wrap;
  }

  .empty-state {
    padding: 60px 20px;
  }
}

/* 平板适配 */
@media (min-width: 768px) and (max-width: 1024px) {
  .breadcrumb-container {
    padding: 6px 16px;
  }

  .toolbar-container {
    padding: 10px 16px;
  }
}
</style>
