// 旧的 DTO（保持向后兼容）
export * from './create-genTable-dto';
export * from './create-genTableCloumn-dto';

// 新的扩展 DTO（使用别名避免冲突）
export {
  TplCategory,
  TplWebType,
  CreateGenTableDto as CreateGenTableExtDto,
  UpdateGenTableDto as UpdateGenTableExtDto,
  QueryGenTableDto,
  QueryDbTableDto,
  ImportTablesDto,
  TableIdsDto,
  GenerateCodeDto,
  SyncTableDto,
  BatchGenCodeDto,
} from './gen-table.dto';

export {
  QueryType,
  HtmlType,
  CreateGenTableColumnDto,
  GenTableColumnUpdateDto,
  ColumnSortDto,
  BatchColumnSortDto,
} from './gen-table-column.dto';

// 响应 DTO
export * from './responses';
