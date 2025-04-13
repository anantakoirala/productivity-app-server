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
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: updateTaskDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

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

      const currentTagIds = currentTask.taskTags.map((tt) => tt.tagId);
      const tagsToDisconnect = currentTagIds.filter(
        (tagId) => !updateTaskDto.activeTagIds.includes(tagId),
      );
      const tagsToConnect = updateTaskDto.activeTagIds.filter(
        (tagId) => !currentTagIds.includes(tagId),
      );

      const updatedTask = await this.prisma.$transaction(
        async (tx) => {
          let taskDateId = currentTask.dateId;

          // Update or create TaskDate
          if (currentTask.dateId) {
            await tx.taskDate.update({
              where: { id: currentTask.dateId },
              data: {
                from: updateTaskDto.date.from,
                to: updateTaskDto.date.to,
              },
            });
          } else {
            const newDate = await tx.taskDate.create({
              data: {
                from: updateTaskDto.date.from,
                to: updateTaskDto.date.to,
              },
            });
            taskDateId = newDate.id;
          }

          const updated = await tx.task.update({
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
                  data: tagsToConnect.map((tagId) => ({ tagId })),
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

          return updated;
        },
        {
          timeout: 10000, // 10 seconds max transaction time
          maxWait: 5000, // 5 seconds to wait for acquiring lock
        },
      );

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
