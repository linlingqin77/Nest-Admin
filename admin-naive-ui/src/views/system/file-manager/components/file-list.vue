<template>
    <div class="file-list-view">
        <n-data-table :columns="columns" :data="fileList" :loading="loading" :row-key="(row: FileItem) => row.id"
            :virtual-scroll="fileList.length > VIRTUAL_SCROLL_THRESHOLD" :max-height="600"
            :checked-row-keys="checkedRowKeys" striped @update:checked-row-keys="handleCheck" @scroll="handleScroll" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue';
import { NDataTable, NEllipsis, NCheckbox, NIcon, useThemeVars } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import {
    TABLE_ROW_HEIGHT,
    VIRTUAL_SCROLL_THRESHOLD,
    FILE_ICON_SIZE,
    formatFileSize,
    formatDate,
    getFileIcon
} from '../constants';

export interface FileItem {
    type: 'folder' | 'file';
    id: string | number;
    name: string;
    size?: number;
    createTime?: string;
    updateTime?: string;
    thumbnail?: string;
    ext?: string;
    url?: string;
}

interface Props {
    fileList: FileItem[];
    loading?: boolean;
    checkedKeys?: (string | number)[];
}

interface Emits {
    (e: 'update:checkedKeys', keys: (string | number)[]): void;
    (e: 'itemClick', item: FileItem): void;
    (e: 'itemDblClick', item: FileItem): void;
    (e: 'contextMenu', event: MouseEvent, item: FileItem): void;
    (e: 'scroll', event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    checkedKeys: () => []
});

const emit = defineEmits<Emits>();

const themeVars = useThemeVars();
const checkedRowKeys = ref<(string | number)[]>(props.checkedKeys);

// 列定义
const columns = computed<DataTableColumns<FileItem>>(() => [
    {
        type: 'selection',
        width: 48,
        cellProps: () => ({
            class: 'checkbox-cell'
        })
    },
    {
        title: '文件名',
        key: 'name',
        minWidth: 300,
        ellipsis: {
            tooltip: true
        },
        render: (row) => {
            const iconClass = getFileIcon(row.ext, row.type === 'folder');
            return h(
                'div',
                {
                    class: 'file-name-cell',
                    onClick: () => emit('itemClick', row),
                    onDblclick: () => emit('itemDblClick', row),
                    onContextmenu: (e: MouseEvent) => {
                        e.preventDefault();
                        emit('contextMenu', e, row);
                    }
                },
                [
                    h('i', {
                        class: `${iconClass} file-icon`,
                        style: {
                            fontSize: '24px',
                            color: row.type === 'folder' ? '#ffc107' : undefined
                        }
                    }),
                    h(
                        NEllipsis,
                        { style: { flex: 1 } },
                        { default: () => row.name }
                    )
                ]
            );
        }
    },
    {
        title: '大小',
        key: 'size',
        width: 120,
        render: (row) => (row.type === 'file' ? formatFileSize(row.size) : '-')
    },
    {
        title: '修改时间',
        key: 'updateTime',
        width: 180,
        render: (row) => formatDate(row.updateTime || row.createTime)
    }
]);

// 处理选中
function handleCheck(keys: (string | number)[]) {
    checkedRowKeys.value = keys;
    emit('update:checkedKeys', keys);
}

// 处理滚动
function handleScroll(event: Event) {
    emit('scroll', event);

    // 检测是否滚动到底部，触发加载更多
    const target = event.target as HTMLElement;
    if (target) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            // 即将到达底部
            emit('scroll', event);
        }
    }
}

// 监听 props 变化
watch(() => props.checkedKeys, (newKeys) => {
    checkedRowKeys.value = newKeys;
});
</script>

<style scoped lang="scss">
.file-list-view {
    width: 100%;
    height: 100%;

    /* 表头样式 */
    :deep(.n-data-table-th) {
        height: v-bind('TABLE_ROW_HEIGHT + "px"');
        font-size: 12px;
        color: v-bind('themeVars.textColor2');
        line-height: 1;
    }

    /* 表格行样式 */
    :deep(.n-data-table-td) {
        height: v-bind('TABLE_ROW_HEIGHT + "px"');
        font-size: 12px;
        line-height: 1;
    }

    /* 选中行样式 */
    :deep(.n-data-table-tr--selected) {
        background-color: v-bind('themeVars.primaryColorSuppl + "1A"') !important;
    }

    /* 悬停行样式 */
    :deep(.n-data-table-tr:hover) {
        background-color: #f7f9fc;
    }

    /* 暗色模式悬停 */
    :deep(.n-data-table-tr:hover) {
        background-color: v-bind('themeVars.hoverColor');
    }

    /* Checkbox 默认隐藏，悬停和选中时显示 */
    :deep(.checkbox-cell .n-checkbox) {
        opacity: 0;
        transition: opacity 0.2s;
    }

    :deep(.n-data-table-tr:hover .checkbox-cell .n-checkbox),
    :deep(.n-checkbox--checked) {
        opacity: 1;
    }

    /* 文件名单元格 */
    .file-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: v-bind('themeVars.primaryColor');
        }

        .file-icon {
            font-size: v-bind('FILE_ICON_SIZE + "px"');
            flex-shrink: 0;
        }
    }
}
</style>
