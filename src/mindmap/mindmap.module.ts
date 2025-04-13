import { Module } from '@nestjs/common';
import { MindmapService } from './mindmap.service';
import { MindmapController } from './mindmap.controller';

@Module({
  controllers: [MindmapController],
  providers: [MindmapService],
})
export class MindmapModule {}
