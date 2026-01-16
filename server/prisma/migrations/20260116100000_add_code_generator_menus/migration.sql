-- Add menu records for Enterprise Code Generator features
-- Data Source Management, Template Management, and Generation History

-- Data Source Management Menu (Parent: 3 - System Tools)
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1079, '000000', '数据源管理', 3, 4, 'gen/datasource', 'tool/gen/datasource/index', '', '1', '0', 'C', '0', '0', 'tool:datasource:list', 'database', 'admin', NOW(), '', NULL, '数据源管理菜单', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Data Source Management Buttons
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1080, '000000', '数据源查询', 1079, 1, '#', '', '', '1', '0', 'F', '0', '0', 'tool:datasource:query', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1081, '000000', '数据源新增', 1079, 2, '#', '', '', '1', '0', 'F', '0', '0', 'tool:datasource:add', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1082, '000000', '数据源修改', 1079, 3, '#', '', '', '1', '0', 'F', '0', '0', 'tool:datasource:edit', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1083, '000000', '数据源删除', 1079, 4, '#', '', '', '1', '0', 'F', '0', '0', 'tool:datasource:remove', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1084, '000000', '连接测试', 1079, 5, '#', '', '', '1', '0', 'F', '0', '0', 'tool:datasource:test', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Template Management Menu (Parent: 3 - System Tools)
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1085, '000000', '模板管理', 3, 5, 'gen/template', 'tool/gen/template/index', '', '1', '0', 'C', '0', '0', 'tool:template:list', 'documentation', 'admin', NOW(), '', NULL, '模板管理菜单', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Template Management Buttons
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1086, '000000', '模板查询', 1085, 1, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:query', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1087, '000000', '模板新增', 1085, 2, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:add', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1088, '000000', '模板修改', 1085, 3, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:edit', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1089, '000000', '模板删除', 1085, 4, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:remove', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1090, '000000', '模板导入', 1085, 5, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:import', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1091, '000000', '模板导出', 1085, 6, '#', '', '', '1', '0', 'F', '0', '0', 'tool:template:export', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Generation History Menu (Parent: 3 - System Tools)
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1092, '000000', '生成历史', 3, 6, 'gen/history', 'tool/gen/history/index', '', '1', '0', 'C', '0', '0', 'tool:history:list', 'time', 'admin', NOW(), '', NULL, '生成历史菜单', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Generation History Buttons
INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1093, '000000', '历史查询', 1092, 1, '#', '', '', '1', '0', 'F', '0', '0', 'tool:history:query', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1094, '000000', '历史删除', 1092, 2, '#', '', '', '1', '0', 'F', '0', '0', 'tool:history:remove', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

INSERT INTO "sys_menu" ("menu_id", "tenant_id", "menu_name", "parent_id", "order_num", "path", "component", "query", "is_frame", "is_cache", "menu_type", "visible", "status", "perms", "icon", "create_by", "create_time", "update_by", "update_time", "remark", "del_flag")
VALUES (1095, '000000', '历史下载', 1092, 3, '#', '', '', '1', '0', 'F', '0', '0', 'tool:history:download', '#', 'admin', NOW(), '', NULL, '', '0')
ON CONFLICT ("menu_id") DO NOTHING;

-- Add role-menu associations for admin role (roleId: 1)
INSERT INTO "sys_role_menu" ("role_id", "menu_id")
VALUES 
  (1, 1079), (1, 1080), (1, 1081), (1, 1082), (1, 1083), (1, 1084),
  (1, 1085), (1, 1086), (1, 1087), (1, 1088), (1, 1089), (1, 1090), (1, 1091),
  (1, 1092), (1, 1093), (1, 1094), (1, 1095)
ON CONFLICT DO NOTHING;

-- Update tenant package to include new menus
UPDATE "sys_tenant_package" 
SET "menu_ids" = "menu_ids" || ',1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095'
WHERE "package_id" = 1;
