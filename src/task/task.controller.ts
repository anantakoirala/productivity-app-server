import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';

import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUserToTaskDto } from './dto/assign-user-to-task.dto';
import { RemoveUserFromTaskDto } from './dto/remove-user-from-task.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('asign-user')
  assignUserToTask(
    @Body() assignUserToTask: AssignUserToTaskDto,
    @GetUser() user: { userId: number },
  ) {
    return this.taskService.assignUserToTask(assignUserToTask, user.userId);
  }

  @Post('remove-user')
  removeUserFromTask(
    @Body() removeUserFromTaskDto: RemoveUserFromTaskDto,
    @GetUser() user: { userId: number },
  ) {
    return this.taskService.removeUserFromTask(
      removeUserFromTaskDto,
      user.userId,
    );
  }

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: { userId: number },
  ) {
    return this.taskService.create(createTaskDto, user.userId);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':workspaceId/:taskId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.findOne(+workspaceId, +taskId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
