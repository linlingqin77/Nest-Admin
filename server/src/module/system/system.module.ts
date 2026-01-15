import { Module, Global } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { DeptModule } from './dept/dept.module';
import { SysConfigModule } from './config/config.module';
import { DictModule } from './dict/dict.module';
import { DocsModule } from './docs/docs.module';
import { MenuModule } from './menu/menu.module';
import { NoticeModule } from './notice/notice.module';
import { PostModule } from './post/post.module';
import { RoleModule } from './role/role.module';
import { ToolModule } from './tool/tool.module';
import { UserModule } from './user/user.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantPackageModule } from './tenant-package/tenant-package.module';
import { FileManagerModule } from './file-manager/file-manager.module';
import { SmsModule } from './sms/sms.module';
import { MailModule } from './mail/mail.module';
import { NotifyModule } from './notify/notify.module';

@Global()
@Module({
  imports: [
    AuthModule,
    ClientModule, // 客户端管理
    SysConfigModule, // 系统配置
    DeptModule,
    DictModule,
    DocsModule, // API 文档
    MenuModule,
    NoticeModule,
    PostModule,
    RoleModule,
    TenantModule, // 租户管理
    TenantPackageModule, // 租户套餐管理
    ToolModule,
    UserModule,
    FileManagerModule, // 文件管理
    SmsModule, // 短信管理
    MailModule, // 邮件管理
    NotifyModule, // 站内信管理
  ],
})
export class SystemModule {}
