import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { ToolRepository } from './tool.repository';

@Module({
  imports: [],
  controllers: [ToolController],
  providers: [ToolService, ToolRepository],
})
export class ToolModule {}
