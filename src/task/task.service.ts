import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  async create(createTaskDto: CreateTaskDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: createTaskDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: createTaskDto.workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }

      if (
        userSubscription.useRole === 'CAN_EDIT' ||
        userSubscription.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const task = await this.prisma.task.create({
        data: {
          workspaceId: createTaskDto.workspaceId,
          creatorId: userId,
        },
      });
      return { success: true, task };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all task`;
  }

  async findOne(workspaceId: number, taskId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const task = await this.prisma.task.findFirst({
        where: { id: taskId, workspaceId: workspace.id },
        include: {
          date: true,
          taskTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                  color: true,
                },
              },
            },
          },
        },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      return { success: true, task };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      // Step 1: Check if the workspace exists
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: updateTaskDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      // Step 2: Fetch the current task's tags to compare with the new tags
      const currentTask = await this.prisma.task.findUnique({
        where: { id },
        include: {
          taskTags: {
            select: { tagId: true },
          },
        },
      });

      if (!currentTask) {
        throw new NotFoundException('Task not found');
      }

      console.log('task', currentTask);
      // Extract the current tag IDs from the existing task
      const currentTagIds = currentTask.taskTags.map(
        (taskTag) => taskTag.tagId,
      );

      // Determine which tags to disconnect and which to connect
      const tagsToDisconnect = currentTagIds.filter(
        (tagId) => !updateTaskDto.activeTagIds.includes(tagId),
      );

      const tagsToConnect = updateTaskDto.activeTagIds.filter(
        (tagId) => !currentTagIds.includes(tagId),
      );
      const transaction = await this.prisma.$transaction(async (tx) => {
        let taskDateId: number | null = currentTask.dateId;
        if (currentTask.dateId) {
          console.log('update');
          await tx.taskDate.update({
            where: {
              id: currentTask.dateId,
            },
            data: {
              from: updateTaskDto.date.from,
              to: updateTaskDto.date.to,
            },
          });
        } else {
          const newTaskDate = await tx.taskDate.create({
            data: {
              from: updateTaskDto.date.from,
              to: updateTaskDto.date.to,
            },
          });
          taskDateId = newTaskDate.id;
        }

        const updatedTask = await tx.task.update({
          where: { id: currentTask.id },
          data: {
            title: updateTaskDto.title,
            emoji: updateTaskDto.icon,
            content: updateTaskDto.content,
            dateId: taskDateId,
            taskTags: {
              deleteMany: {
                tagId: { in: tagsToDisconnect },
              },
              createMany: {
                data: tagsToConnect.map((tagId) => ({
                  tagId,
                })),
                skipDuplicates: true,
              },
            },
          },
          include: {
            taskTags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    isActive: true,
                    color: true,
                  },
                },
              },
            },
          },
        });
        return updatedTask;
      });

      return { success: true, task: transaction };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
