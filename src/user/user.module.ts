import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer.config';

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
