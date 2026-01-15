import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { OssConfigModule } from './oss-config/oss-config.module';
import { OssModule } from './oss/oss.module';

@Module({
  imports: [OssConfigModule, OssModule],
  controllers: [SseController],
  providers: [SseService],
  exports: [SseService],
})
export class ResourceModule {}
