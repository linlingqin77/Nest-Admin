-- CreateTable
CREATE TABLE "sys_tenant" (
    "id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL,
    "contact_user_name" VARCHAR(50),
    "contact_phone" VARCHAR(20),
    "company_name" VARCHAR(100) NOT NULL,
    "license_number" VARCHAR(50),
    "address" VARCHAR(200),
    "intro" TEXT,
    "domain" VARCHAR(100),
    "package_id" INTEGER,
    "expire_time" TIMESTAMP(6),
    "account_count" INTEGER NOT NULL DEFAULT -1,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_tenant_package" (
    "package_id" SERIAL NOT NULL,
    "package_name" VARCHAR(50) NOT NULL,
    "menu_ids" TEXT,
    "menu_check_strictly" BOOLEAN NOT NULL DEFAULT false,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_tenant_package_pkey" PRIMARY KEY ("package_id")
);

-- CreateTable
CREATE TABLE "sys_client" (
    "id" SERIAL NOT NULL,
    "client_id" VARCHAR(64) NOT NULL,
    "client_key" VARCHAR(64) NOT NULL,
    "client_secret" VARCHAR(255) NOT NULL,
    "grant_type_list" VARCHAR(255),
    "device_type" VARCHAR(20),
    "active_timeout" INTEGER NOT NULL DEFAULT 1800,
    "timeout" INTEGER NOT NULL DEFAULT 86400,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gen_table" (
    "table_id" SERIAL NOT NULL,
    "table_name" VARCHAR(200) NOT NULL,
    "table_comment" VARCHAR(500) NOT NULL,
    "sub_table_name" VARCHAR(64),
    "sub_table_fk_name" VARCHAR(64),
    "class_name" VARCHAR(100) NOT NULL,
    "tpl_category" VARCHAR(200) NOT NULL,
    "tpl_web_type" VARCHAR(30) NOT NULL,
    "package_name" VARCHAR(100) NOT NULL,
    "module_name" VARCHAR(30) NOT NULL,
    "business_name" VARCHAR(30) NOT NULL,
    "function_name" VARCHAR(50) NOT NULL,
    "function_author" VARCHAR(50) NOT NULL,
    "gen_type" CHAR(1) NOT NULL,
    "gen_path" VARCHAR(200) NOT NULL,
    "options" VARCHAR(1000) NOT NULL,
    "status" CHAR(1) NOT NULL,
    "del_flag" CHAR(1) NOT NULL,
    "create_by" VARCHAR(64) NOT NULL,
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL,
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "gen_table_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "gen_table_column" (
    "column_id" SERIAL NOT NULL,
    "table_id" INTEGER NOT NULL,
    "column_name" VARCHAR(200) NOT NULL,
    "column_comment" VARCHAR(500) NOT NULL,
    "column_type" VARCHAR(100) NOT NULL,
    "java_type" VARCHAR(500) NOT NULL,
    "java_field" VARCHAR(200) NOT NULL,
    "is_pk" CHAR(1) NOT NULL,
    "is_increment" CHAR(1) NOT NULL,
    "is_required" CHAR(1) NOT NULL,
    "is_insert" CHAR(1) NOT NULL,
    "is_edit" CHAR(1),
    "is_list" CHAR(1),
    "is_query" CHAR(1),
    "query_type" VARCHAR(200) NOT NULL,
    "html_type" VARCHAR(200) NOT NULL,
    "dict_type" VARCHAR(200) NOT NULL,
    "column_default" VARCHAR(200),
    "sort" INTEGER NOT NULL,
    "status" CHAR(1) NOT NULL,
    "del_flag" CHAR(1) NOT NULL,
    "create_by" VARCHAR(64) NOT NULL,
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL,
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "gen_table_column_pkey" PRIMARY KEY ("column_id")
);

-- CreateTable
CREATE TABLE "sys_config" (
    "config_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
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

    CONSTRAINT "sys_config_pkey" PRIMARY KEY ("config_id")
);

-- CreateTable
CREATE TABLE "sys_dept" (
    "dept_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "parent_id" INTEGER NOT NULL,
    "ancestors" VARCHAR(50) NOT NULL,
    "dept_name" VARCHAR(30) NOT NULL,
    "order_num" INTEGER NOT NULL,
    "leader" VARCHAR(20) NOT NULL DEFAULT '',
    "phone" VARCHAR(11) NOT NULL DEFAULT '',
    "email" VARCHAR(50) NOT NULL DEFAULT '',
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_dept_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "sys_dict_data" (
    "dict_code" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "dict_sort" INTEGER NOT NULL DEFAULT 0,
    "dict_label" VARCHAR(100) NOT NULL,
    "dict_value" VARCHAR(100) NOT NULL,
    "dict_type" VARCHAR(100) NOT NULL,
    "css_class" VARCHAR(100) NOT NULL DEFAULT '',
    "list_class" VARCHAR(100) NOT NULL DEFAULT '',
    "is_default" CHAR(1) NOT NULL DEFAULT 'N',
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',

    CONSTRAINT "sys_dict_data_pkey" PRIMARY KEY ("dict_code")
);

-- CreateTable
CREATE TABLE "sys_dict_type" (
    "dict_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "dict_name" VARCHAR(100) NOT NULL,
    "dict_type" VARCHAR(100) NOT NULL,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',

    CONSTRAINT "sys_dict_type_pkey" PRIMARY KEY ("dict_id")
);

-- CreateTable
CREATE TABLE "sys_job" (
    "job_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "job_name" VARCHAR(64) NOT NULL,
    "job_group" VARCHAR(64) NOT NULL,
    "invoke_target" VARCHAR(500) NOT NULL,
    "cron_expression" VARCHAR(255),
    "misfire_policy" VARCHAR(20),
    "concurrent" CHAR(1),
    "status" CHAR(1),
    "create_by" VARCHAR(64) NOT NULL,
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL,
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_job_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "sys_job_log" (
    "job_log_id" SERIAL NOT NULL,
    "job_name" VARCHAR(64) NOT NULL,
    "job_group" VARCHAR(64) NOT NULL,
    "invoke_target" VARCHAR(500) NOT NULL,
    "job_message" VARCHAR(500),
    "status" CHAR(1) NOT NULL,
    "exception_info" VARCHAR(2000),
    "create_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_job_log_pkey" PRIMARY KEY ("job_log_id")
);

-- CreateTable
CREATE TABLE "sys_logininfor" (
    "info_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "user_name" VARCHAR(50) NOT NULL,
    "ipaddr" VARCHAR(128) NOT NULL,
    "login_location" VARCHAR(255) NOT NULL DEFAULT '',
    "browser" VARCHAR(50) NOT NULL,
    "os" VARCHAR(50) NOT NULL,
    "device_type" CHAR(1) NOT NULL DEFAULT '0',
    "status" CHAR(1) NOT NULL,
    "msg" VARCHAR(255) NOT NULL,
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "login_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_logininfor_pkey" PRIMARY KEY ("info_id")
);

-- CreateTable
CREATE TABLE "sys_menu" (
    "menu_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "menu_name" VARCHAR(50) NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "order_num" INTEGER NOT NULL,
    "path" VARCHAR(200) NOT NULL DEFAULT '',
    "component" VARCHAR(255),
    "query" VARCHAR(255) NOT NULL DEFAULT '',
    "is_frame" CHAR(1) NOT NULL,
    "is_cache" CHAR(1) NOT NULL,
    "menu_type" CHAR(1) NOT NULL,
    "visible" CHAR(1) NOT NULL,
    "status" CHAR(1) NOT NULL,
    "perms" VARCHAR(100) NOT NULL DEFAULT '',
    "icon" VARCHAR(100) NOT NULL DEFAULT '',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',

    CONSTRAINT "sys_menu_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "sys_notice" (
    "notice_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "notice_title" VARCHAR(50) NOT NULL,
    "notice_type" CHAR(1) NOT NULL,
    "notice_content" TEXT,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "remark" VARCHAR(500),

    CONSTRAINT "sys_notice_pkey" PRIMARY KEY ("notice_id")
);

-- CreateTable
CREATE TABLE "sys_oper_log" (
    "oper_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "title" VARCHAR(50) NOT NULL,
    "business_type" INTEGER NOT NULL,
    "request_method" VARCHAR(10) NOT NULL,
    "operator_type" INTEGER NOT NULL,
    "oper_name" VARCHAR(50) NOT NULL,
    "dept_name" VARCHAR(50) NOT NULL,
    "oper_url" VARCHAR(255) NOT NULL,
    "oper_location" VARCHAR(255) NOT NULL,
    "oper_param" VARCHAR(2000) NOT NULL,
    "json_result" VARCHAR(2000) NOT NULL,
    "error_msg" VARCHAR(2000) NOT NULL,
    "method" VARCHAR(100) NOT NULL,
    "oper_ip" VARCHAR(255) NOT NULL,
    "oper_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" CHAR(1) NOT NULL,
    "cost_time" INTEGER NOT NULL,

    CONSTRAINT "sys_oper_log_pkey" PRIMARY KEY ("oper_id")
);

-- CreateTable
CREATE TABLE "sys_post" (
    "post_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "dept_id" INTEGER,
    "post_code" VARCHAR(64) NOT NULL,
    "post_category" VARCHAR(100),
    "post_name" VARCHAR(50) NOT NULL,
    "post_sort" INTEGER NOT NULL DEFAULT 0,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',

    CONSTRAINT "sys_post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "sys_role" (
    "role_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "role_name" VARCHAR(30) NOT NULL,
    "role_key" VARCHAR(100) NOT NULL,
    "role_sort" INTEGER NOT NULL,
    "data_scope" CHAR(1) NOT NULL DEFAULT '1',
    "menu_check_strictly" BOOLEAN NOT NULL DEFAULT false,
    "dept_check_strictly" BOOLEAN NOT NULL DEFAULT false,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "sys_role_dept" (
    "role_id" INTEGER NOT NULL,
    "dept_id" INTEGER NOT NULL,

    CONSTRAINT "sys_role_dept_pkey" PRIMARY KEY ("role_id","dept_id")
);

-- CreateTable
CREATE TABLE "sys_role_menu" (
    "role_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,

    CONSTRAINT "sys_role_menu_pkey" PRIMARY KEY ("role_id","menu_id")
);

-- CreateTable
CREATE TABLE "sys_file_folder" (
    "folder_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "parent_id" INTEGER NOT NULL DEFAULT 0,
    "folder_name" VARCHAR(100) NOT NULL,
    "folder_path" VARCHAR(500) NOT NULL,
    "order_num" INTEGER NOT NULL DEFAULT 0,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_file_folder_pkey" PRIMARY KEY ("folder_id")
);

-- CreateTable
CREATE TABLE "sys_upload" (
    "upload_id" VARCHAR(255) NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "folder_id" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "new_file_name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "ext" VARCHAR(50),
    "mime_type" VARCHAR(100),
    "storage_type" VARCHAR(20) NOT NULL DEFAULT 'local',
    "file_md5" VARCHAR(32),
    "thumbnail" VARCHAR(500),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_upload_pkey" PRIMARY KEY ("upload_id")
);

-- CreateTable
CREATE TABLE "sys_file_share" (
    "share_id" VARCHAR(64) NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "upload_id" VARCHAR(255) NOT NULL,
    "share_code" VARCHAR(6),
    "expire_time" TIMESTAMP(6),
    "max_download" INTEGER NOT NULL DEFAULT -1,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sys_file_share_pkey" PRIMARY KEY ("share_id")
);

-- CreateTable
CREATE TABLE "sys_user" (
    "user_id" SERIAL NOT NULL,
    "tenant_id" VARCHAR(20) NOT NULL DEFAULT '000000',
    "dept_id" INTEGER,
    "user_name" VARCHAR(30) NOT NULL,
    "nick_name" VARCHAR(30) NOT NULL,
    "user_type" VARCHAR(2) NOT NULL,
    "email" VARCHAR(50) NOT NULL DEFAULT '',
    "phonenumber" VARCHAR(11) NOT NULL DEFAULT '',
    "sex" CHAR(1) NOT NULL DEFAULT '0',
    "avatar" VARCHAR(255) NOT NULL DEFAULT '',
    "password" VARCHAR(200) NOT NULL,
    "status" CHAR(1) NOT NULL DEFAULT '0',
    "del_flag" CHAR(1) NOT NULL DEFAULT '0',
    "login_ip" VARCHAR(128) NOT NULL DEFAULT '',
    "login_date" TIMESTAMP(6),
    "create_by" VARCHAR(64) NOT NULL DEFAULT '',
    "create_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "update_by" VARCHAR(64) NOT NULL DEFAULT '',
    "update_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "remark" VARCHAR(500),

    CONSTRAINT "sys_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sys_user_post" (
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "sys_user_post_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "sys_user_role" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "sys_user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sys_tenant_tenant_id_key" ON "sys_tenant"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sys_client_client_id_key" ON "sys_client"("client_id");

-- CreateIndex
CREATE INDEX "sys_config_tenant_id_status_idx" ON "sys_config"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_config_config_key_idx" ON "sys_config"("config_key");

-- CreateIndex
CREATE UNIQUE INDEX "sys_config_tenant_id_config_key_key" ON "sys_config"("tenant_id", "config_key");

-- CreateIndex
CREATE INDEX "sys_dept_tenant_id_status_idx" ON "sys_dept"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_dept_tenant_id_parent_id_idx" ON "sys_dept"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "sys_dept_status_idx" ON "sys_dept"("status");

-- CreateIndex
CREATE INDEX "sys_dict_data_tenant_id_dict_type_status_idx" ON "sys_dict_data"("tenant_id", "dict_type", "status");

-- CreateIndex
CREATE INDEX "sys_dict_data_dict_type_idx" ON "sys_dict_data"("dict_type");

-- CreateIndex
CREATE UNIQUE INDEX "sys_dict_data_tenant_id_dict_type_dict_value_key" ON "sys_dict_data"("tenant_id", "dict_type", "dict_value");

-- CreateIndex
CREATE INDEX "sys_dict_type_tenant_id_status_idx" ON "sys_dict_type"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_dict_type_dict_type_idx" ON "sys_dict_type"("dict_type");

-- CreateIndex
CREATE UNIQUE INDEX "sys_dict_type_tenant_id_dict_type_key" ON "sys_dict_type"("tenant_id", "dict_type");

-- CreateIndex
CREATE INDEX "sys_job_tenant_id_status_idx" ON "sys_job"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_logininfor_tenant_id_login_time_idx" ON "sys_logininfor"("tenant_id", "login_time");

-- CreateIndex
CREATE INDEX "sys_logininfor_user_name_idx" ON "sys_logininfor"("user_name");

-- CreateIndex
CREATE INDEX "sys_logininfor_status_idx" ON "sys_logininfor"("status");

-- CreateIndex
CREATE INDEX "sys_logininfor_login_time_idx" ON "sys_logininfor"("login_time");

-- CreateIndex
CREATE INDEX "sys_menu_tenant_id_status_idx" ON "sys_menu"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_menu_tenant_id_parent_id_idx" ON "sys_menu"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "sys_menu_status_idx" ON "sys_menu"("status");

-- CreateIndex
CREATE INDEX "sys_oper_log_tenant_id_oper_time_idx" ON "sys_oper_log"("tenant_id", "oper_time");

-- CreateIndex
CREATE INDEX "sys_oper_log_oper_name_idx" ON "sys_oper_log"("oper_name");

-- CreateIndex
CREATE INDEX "sys_oper_log_status_idx" ON "sys_oper_log"("status");

-- CreateIndex
CREATE INDEX "sys_oper_log_oper_time_idx" ON "sys_oper_log"("oper_time");

-- CreateIndex
CREATE INDEX "sys_oper_log_business_type_idx" ON "sys_oper_log"("business_type");

-- CreateIndex
CREATE INDEX "sys_post_tenant_id_status_idx" ON "sys_post"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_post_dept_id_idx" ON "sys_post"("dept_id");

-- CreateIndex
CREATE INDEX "sys_role_tenant_id_status_idx" ON "sys_role"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_role_tenant_id_role_key_idx" ON "sys_role"("tenant_id", "role_key");

-- CreateIndex
CREATE INDEX "sys_role_role_key_idx" ON "sys_role"("role_key");

-- CreateIndex
CREATE INDEX "sys_file_folder_tenant_id_parent_id_idx" ON "sys_file_folder"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "sys_upload_tenant_id_folder_id_idx" ON "sys_upload"("tenant_id", "folder_id");

-- CreateIndex
CREATE INDEX "sys_upload_file_md5_idx" ON "sys_upload"("file_md5");

-- CreateIndex
CREATE INDEX "sys_file_share_share_id_share_code_idx" ON "sys_file_share"("share_id", "share_code");

-- CreateIndex
CREATE INDEX "sys_user_tenant_id_status_idx" ON "sys_user"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sys_user_tenant_id_user_name_idx" ON "sys_user"("tenant_id", "user_name");

-- CreateIndex
CREATE INDEX "sys_user_tenant_id_create_time_idx" ON "sys_user"("tenant_id", "create_time");

-- CreateIndex
CREATE INDEX "sys_user_user_name_idx" ON "sys_user"("user_name");

-- CreateIndex
CREATE INDEX "sys_user_dept_id_idx" ON "sys_user"("dept_id");

-- CreateIndex
CREATE INDEX "sys_user_status_idx" ON "sys_user"("status");

-- AddForeignKey
ALTER TABLE "gen_table_column" ADD CONSTRAINT "gen_table_column_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "gen_table"("table_id") ON DELETE CASCADE ON UPDATE CASCADE;
