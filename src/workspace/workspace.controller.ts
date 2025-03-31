import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/decorators/getUser';

@UseGuards(AuthGuard('jwt'))
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @UseInterceptors(FileInterceptor('workspaceImage'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createWorkspaceDto: CreateWorkSpaceDto,
    @GetUser() user: { userId: number },
  ) {
    return this.workspaceService.create(createWorkspaceDto, user.userId, file);
  }

  @Get()
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workspaceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(+id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceService.remove(+id);
  }
}
