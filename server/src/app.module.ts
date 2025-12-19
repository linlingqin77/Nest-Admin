import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/app-config.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import configuration from './config/index';
import { validate } from './config/env.validation';
import { AppConfigModule } from './config/app-config.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';
import { TenantMiddleware, TenantGuard, TenantModule } from './common/tenant';
import { CryptoModule, DecryptInterceptor } from './common/crypto';
import { LoggerModule } from './common/logger';
import { ClsModule } from './common/cls';
import { TransactionalInterceptor } from './common/interceptors/transactional.interceptor';

import { MainModule } from './module/main/main.module';
import { UploadModule } from './module/upload/upload.module';
import { SystemModule } from './module/system/system.module';
import { CommonModule } from './module/common/common.module';
import { MonitorModule } from './module/monitor/monitor.module';
import { ResourceModule } from './module/resource/resource.module';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  imports: [
    // 配置模块 - 强类型配置验证
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
      isGlobal: true,
      validate,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // 类型安全的配置服务模块
    AppConfigModule,
    // Pino 日志模块
    LoggerModule,
    // CLS 上下文模块 (Request ID)
    ClsModule,
    // 数据库改为 Prisma + PostgreSQL
    PrismaModule,
    // 多租户模块
    TenantModule,
    // 加解密模块
    CryptoModule,
    // API 限流模块
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    // Bull 队列模块 (用于异步任务处理)
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        },
      }),
    }),

    MainModule,
    UploadModule,

    CommonModule,
    SystemModule,
    MonitorModule,
    ResourceModule,
  ],
  providers: [
    // 解密拦截器 (解密前端加密请求)
    {
      provide: APP_INTERCEPTOR,
      useClass: DecryptInterceptor,
    },
    // 事务拦截器 (自动处理 @Transactional 装饰器)
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionalInterceptor,
    },
    // 租户守卫
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    // API 限流守卫
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 租户中间件应用于所有路由
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
