import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Bull队列模块配置
 * 使用Redis作为队列后端存储
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db'),
          keyPrefix: configService.get<string>('redis.keyPrefix') + 'bull:',
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100, // 保留最近100个已完成任务
          removeOnFail: 500, // 保留最近500个失败任务
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class BullConfigModule { }
