-- 创建系统配置表
CREATE TABLE IF NOT EXISTS "sys_system_config" (
    "config_id" SERIAL NOT NULL,
    "config_name" VARCHAR(100) NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" VARCHAR(500) NOT NULL,
    "config_type" CHAR(1) NOT NULL,
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',

    CONSTRAINT "sys_system_config_pkey" PRIMARY KEY ("config_id")
);

-- 创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS "sys_system_config_config_key_key" ON "sys_system_config"("config_key");

-- 创建普通索引
CREATE INDEX IF NOT EXISTS "sys_system_config_status_idx" ON "sys_system_config"("status");
CREATE INDEX IF NOT EXISTS "sys_system_config_config_type_idx" ON "sys_system_config"("config_type");
CREATE INDEX IF NOT EXISTS "sys_system_config_del_flag_status_idx" ON "sys_system_config"("del_flag", "status");
CREATE INDEX IF NOT EXISTS "sys_system_config_create_time_idx" ON "sys_system_config"("create_time");

-- 迁移超级租户(000000)的配置到系统配置表
INSERT INTO "sys_system_config" (
    "config_name",
    "config_key",
    "config_value",
    "config_type",
    "create_by",
    "create_time",
    "update_by",
    "update_time",
    "remark",
    "status",
    "del_flag"
)
SELECT 
    "config_name",
    "config_key",
    "config_value",
    "config_type",
    "create_by",
    "create_time",
    "update_by",
    "update_time",
    "remark",
    "status",
    "del_flag"
FROM "sys_config"
WHERE "tenant_id" = '000000'
ON CONFLICT ("config_key") DO NOTHING;

-- 可选：删除已迁移到系统表的超级租户配置（保留以便回滚）
-- DELETE FROM "sys_config" WHERE "tenant_id" = '000000';

-- 添加注释
COMMENT ON TABLE "sys_system_config" IS '系统级配置表-全局配置，无租户隔离';
COMMENT ON COLUMN "sys_system_config"."config_id" IS '配置主键';
COMMENT ON COLUMN "sys_system_config"."config_name" IS '配置名称';
COMMENT ON COLUMN "sys_system_config"."config_key" IS '配置键名';
COMMENT ON COLUMN "sys_system_config"."config_value" IS '配置键值';
COMMENT ON COLUMN "sys_system_config"."config_type" IS '系统内置（Y是 N否）';
COMMENT ON COLUMN "sys_system_config"."status" IS '状态（0正常 1停用）';
COMMENT ON COLUMN "sys_system_config"."del_flag" IS '删除标志（0代表存在 2代表删除）';
