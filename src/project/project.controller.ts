import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';
import { DeleteProjectDto } from './dto/delete-project.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('delete-project')
  deleteProject(
    @Body() deleteProjectDto: DeleteProjectDto,
    @GetUser() user: { userId: number },
  ) {
    return this.projectService.deleteProject(deleteProjectDto, user.userId);
  }

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: { userId: number },
  ) {
    return this.projectService.create(createProjectDto, user.userId);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':workspaceId/:projectId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @GetUser() user: { userId: number },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.projectService.findOne(
      +workspaceId,
      +projectId,
      user.userId,
      +page,
      +limit,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: { userId: number },
  ) {
    return this.projectService.update(+id, updateProjectDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
