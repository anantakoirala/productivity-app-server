import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MindmapService } from './mindmap.service';

import { CreateMindMapDto } from './dto/create-mindmap.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';
import { UpdateMindMapDto } from './dto/update-mindmap.dto';
import { UpdateMindMapTagsDto } from './dto/update-mindmap-tags.dto';
import { UpdateMindMapInfoDto } from './dto/update-mindmap-info.dto';
import { AssignUserToMindmapDto } from './dto/assign-user-to-mindmap';
import { RemoveUserFromMindmapDto } from './dto/remove-user-from-mindmap.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('mindmap')
export class MindmapController {
  constructor(private readonly mindmapService: MindmapService) {}

  @Post('asign-user')
  assignUserToTask(
    @Body() assignUserToMindmapDto: AssignUserToMindmapDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.assignUserToMindmap(
      assignUserToMindmapDto,
      user.userId,
    );
  }

  @Post('remove-user')
  removeUserFromTask(
    @Body() removeUserFromMindmapDto: RemoveUserFromMindmapDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.removeUserFromMindmap(
      removeUserFromMindmapDto,
      user.userId,
    );
  }

  @Post()
  create(
    @Body() createMindmapDto: CreateMindMapDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.create(createMindmapDto, user.userId);
  }

  @Get()
  findAll() {
    return this.mindmapService.findAll();
  }

  @Get(':workspaceId/:mindMapId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('mindMapId') mindMapId: string,
  ) {
    return this.mindmapService.findOne(+workspaceId, +mindMapId);
  }

  @Patch(':workspaceId/:mindMapId')
  updateMindmapTags(
    @Param('workspaceId') workspaceId: string,
    @Param('mindMapId') mindMapId: string,
    @Body() updateMindMapTagsDto: UpdateMindMapTagsDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.updateMindmapTags(
      +workspaceId,
      +mindMapId,
      updateMindMapTagsDto,
      user.userId,
    );
  }

  @Patch('update-info/:workspaceId/:mindMapId')
  updateMindmapInfo(
    @Param('workspaceId') workspaceId: string,
    @Param('mindMapId') mindMapId: string,
    @Body() updateMindMapInfoDto: UpdateMindMapInfoDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.updateMindmapInfo(
      +workspaceId,
      +mindMapId,
      updateMindMapInfoDto,
      user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMindmapDto: UpdateMindMapDto,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.update(+id, updateMindmapDto, user.userId);
  }

  @Delete(':workspaceId/:mindMapId')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('mindMapId') mindMapId: string,
    @GetUser() user: { userId: number },
  ) {
    return this.mindmapService.remove(+workspaceId, +mindMapId, user.userId);
  }
}
