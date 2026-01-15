import { utils, writeFile } from 'xlsx';
import { isNotNull } from '@/utils/common';
import { $t } from '@/locales';

export interface ExportExcelProps<T> {
  columns: NaiveUI.TableColumn<NaiveUI.TableDataWithIndex<T>>[];
  data: NaiveUI.TableDataWithIndex<T>[];
  filename: string;
  ignoreKeys?: (string | NaiveUI.CustomColumnKey)[];
  dicts?: Record<string, string>;
}

export function exportExcel<T>({
  columns,
  data,
  filename,
  dicts,
  ignoreKeys = ['index', 'operate'],
}: ExportExcelProps<T>) {
  const exportColumns = columns.filter((col) => isTableColumnHasKey(col) && !ignoreKeys?.includes(String(col.key)));

  const excelList = data.map((item) => exportColumns.map((col) => getTableValue(col, item, dicts)));

  const titleList = exportColumns.map((col) => (isTableColumnHasTitle(col) && col.title) || null);

  excelList.unshift(titleList);

  const workBook = utils.book_new();

  const workSheet = utils.aoa_to_sheet(excelList);

  workSheet['!cols'] = exportColumns.map((item) => ({
    width: Math.round(Number(item.width) / 10 || 20),
  }));

  utils.book_append_sheet(workBook, workSheet, filename);

  writeFile(workBook, `${filename}.xlsx`);
}

function getTableValue<T>(
  col: NaiveUI.TableColumn<NaiveUI.TableDataWithIndex<T>>,
  item: NaiveUI.TableDataWithIndex<T>,
  dicts?: Record<string, string>,
) {
  if (!isTableColumnHasKey(col)) {
    return null;
  }

  const { key } = col;
  const keyStr = String(key);

  if (keyStr === 'operate') {
    return null;
  }

  const itemValue = (item as Record<string, any>)[keyStr];

  if (isNotNull(dicts?.[keyStr]) && isNotNull(itemValue)) {
    return $t(itemValue as App.I18n.I18nKey);
  }

  return itemValue;
}

function isTableColumnHasKey<T>(column: NaiveUI.TableColumn<T>): column is NaiveUI.DataTableBaseColumn<T> {
  return Boolean((column as NaiveUI.DataTableBaseColumn<T>).key);
}

function isTableColumnHasTitle<T>(column: NaiveUI.TableColumn<T>): column is NaiveUI.DataTableBaseColumn<T> & {
  title: string;
} {
  return Boolean((column as NaiveUI.DataTableBaseColumn<T>).title);
}
