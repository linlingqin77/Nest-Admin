-- AlterTable
ALTER TABLE "gen_table" ADD COLUMN     "data_source_id" INTEGER,
ADD COLUMN     "template_group_id" INTEGER,
ADD COLUMN     "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "gen_table_column" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_client" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_config" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_dept" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_dict_data" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_dict_type" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_file_folder" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_file_share" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_job" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_job_log" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_logininfor" ALTER COLUMN "login_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_mail_account" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_mail_template" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_menu" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_notice" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_notify_template" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_oper_log" ALTER COLUMN "oper_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_post" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_role" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_sms_channel" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_sms_template" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_system_config" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_tenant" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_tenant_package" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_upload" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sys_user" ALTER COLUMN "create_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "update_time" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "gen_data_source" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "host" VARCHAR(255) NOT NULL,
    "port" INTEGER NOT NULL,
    "database" VARCHAR(100) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(500) NOT NULL,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "gen_data_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gen_template_group" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20),
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gen_template_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gen_template" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "file_name" VARCHAR(200) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "language" VARCHAR(20) NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gen_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gen_history" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "table_name" VARCHAR(200) NOT NULL,
    "template_group_id" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "generated_by" VARCHAR(64) NOT NULL,
    "generated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gen_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_oss_config" (
    "oss_config_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "config_key" VARCHAR(100) NOT NULL,
    "access_key" VARCHAR(255) NOT NULL,
    "secret_key" VARCHAR(255) NOT NULL,
    "bucket_name" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(255),
    "endpoint" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255),
    "is_https" CHAR(1) NOT NULL DEFAULT 'N',
    "region" VARCHAR(100),
    "access_policy" CHAR(1) NOT NULL DEFAULT '1',
    "status" CHAR(1) NOT NULL DEFAULT '1',
    "ext1" VARCHAR(255),
    "remark" VARCHAR(500),
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_oss_config_pkey" PRIMARY KEY ("oss_config_id")
);

-- CreateTable
CREATE TABLE "sys_oss" (
    "oss_id" BIGSERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_suffix" VARCHAR(50) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "service" VARCHAR(50) NOT NULL DEFAULT 'local',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_oss_pkey" PRIMARY KEY ("oss_id")
);

-- CreateIndex
CREATE INDEX "gen_data_source_tenant_id_status_idx" ON "gen_data_source"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gen_data_source_tenant_id_name_key" ON "gen_data_source"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "gen_template_group_tenant_id_status_idx" ON "gen_template_group"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "gen_template_group_tenant_id_name_key" ON "gen_template_group"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "gen_template_group_id_idx" ON "gen_template"("group_id");

-- CreateIndex
CREATE INDEX "gen_template_status_idx" ON "gen_template"("status");

-- CreateIndex
CREATE INDEX "gen_history_tenant_id_table_id_idx" ON "gen_history"("tenant_id", "table_id");

-- CreateIndex
CREATE INDEX "gen_history_generated_at_idx" ON "gen_history"("generated_at");

-- CreateIndex
CREATE INDEX "sys_oss_config_tenant_id_idx" ON "sys_oss_config"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sys_oss_config_tenant_id_config_key_key" ON "sys_oss_config"("tenant_id", "config_key");

-- CreateIndex
CREATE INDEX "sys_oss_tenant_id_idx" ON "sys_oss"("tenant_id");

-- CreateIndex
CREATE INDEX "sys_oss_file_name_idx" ON "sys_oss"("file_name");

-- CreateIndex
CREATE INDEX "gen_table_tenant_id_del_flag_idx" ON "gen_table"("tenant_id", "del_flag");

-- CreateIndex
CREATE INDEX "gen_table_data_source_id_idx" ON "gen_table"("data_source_id");

-- CreateIndex
CREATE INDEX "gen_table_template_group_id_idx" ON "gen_table"("template_group_id");

-- AddForeignKey
ALTER TABLE "gen_template" ADD CONSTRAINT "gen_template_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "gen_template_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gen_history" ADD CONSTRAINT "gen_history_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "gen_table"("table_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gen_history" ADD CONSTRAINT "gen_history_template_group_id_fkey" FOREIGN KEY ("template_group_id") REFERENCES "gen_template_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gen_table" ADD CONSTRAINT "gen_table_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "gen_data_source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gen_table" ADD CONSTRAINT "gen_table_template_group_id_fkey" FOREIGN KEY ("template_group_id") REFERENCES "gen_template_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
