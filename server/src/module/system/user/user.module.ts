import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: AppConfigService) => ({
        secret: config.jwt.secretkey,
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule { }
