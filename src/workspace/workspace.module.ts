import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { multerConfig } from 'src/utils/multer.config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
