import {
  Controller,
  Get,
  Post,
  Body,
  //Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
//import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/decorators/getUser';
import { UpdateWorkspaceImageDto } from './dto/upload-workspace-image.dto';
import { UpdateWorkSpaceDto } from './dto/update-workspace.dto';
import { DeleteWorkspaceDto } from './dto/deleteWorkspace.dto';

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

  @Post('upload-workspace-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateWorkspaceImageDto: UpdateWorkspaceImageDto,
    @GetUser() user: { userId: number },
  ) {
    return this.workspaceService.saveWorkspaceImage(
      updateWorkspaceImageDto,
      user.userId,
      file,
    );
  }

  @Get('setting/:id')
  findSettingDetail(
    @Param('id') id: string,
    @GetUser() user: { userId: number },
  ) {
    return this.workspaceService.getWorkspaceSettingDetail(+id, user.userId);
  }

  @Get()
  findAll(@GetUser() user: { userId: number }) {
    return this.workspaceService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: { userId: number }) {
    return this.workspaceService.findOne(+id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkSpaceDto,
  ) {
    return this.workspaceService.update(+id, updateWorkspaceDto);
  }

  @Post('delete-workspace')
  deleteWorkspace(@Body() deleteWorkspaceDto: DeleteWorkspaceDto) {
    return this.workspaceService.deleteWorkspace(deleteWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceService.remove(+id);
  }
}
