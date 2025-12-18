import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileManagerController } from './file-manager.controller';
import { FileManagerService } from './file-manager.service';
import { FileAccessService } from './services/file-access.service';
import { VersionService } from '../upload/services/version.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [FileManagerController],
  providers: [FileManagerService, FileAccessService, VersionService],
  exports: [FileManagerService, FileAccessService],
})
export class FileManagerModule { }
