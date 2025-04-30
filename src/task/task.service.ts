import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignUserToTaskDto } from './dto/assign-user-to-task.dto';
import { RemoveUserFromTaskDto } from './dto/remove-user-from-task.dto';

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
          projectId: createTaskDto.projectId,
          title: createTaskDto.name,
          date: new Date(),
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
          AssignedToTask: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
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

  async assignUserToTask(
    assignUserToTask: AssignUserToTaskDto,
    userId: number,
  ) {
    const workspace = await this.prisma.workSpace.findFirst({
      where: { id: assignUserToTask.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const userSubscription = await this.prisma.subscription.findFirst({
      where: { userId: userId, workspaceId: assignUserToTask.workspaceId },
    });
    if (!userSubscription) {
      throw new ForbiddenException('Unauthorized');
    }
    if (userSubscription.useRole === 'READ_ONLY') {
      throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
    }
    const task = await this.prisma.task.findUnique({
      where: { id: assignUserToTask.taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const userToAssign = await this.prisma.user.findUnique({
      where: { id: assignUserToTask.userId },
    });

    if (!userToAssign) {
      throw new NotFoundException('User to assign not found');
    }

    const existingAssignment = await this.prisma.assignedToTask.findUnique({
      where: {
        userId_taskId: {
          userId: assignUserToTask.userId,
          taskId: assignUserToTask.taskId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('User already assigned to this task');
    }

    const assignment = await this.prisma.assignedToTask.create({
      data: {
        userId: assignUserToTask.userId,
        taskId: assignUserToTask.taskId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return { success: true, assignment };

    try {
    } catch (error) {
      throw error;
    }
  }

  async removeUserFromTask(
    removeUserFromTaskDto: RemoveUserFromTaskDto,
    userId: number,
  ) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: removeUserFromTaskDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: userId,
          workspaceId: removeUserFromTaskDto.workspaceId,
        },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }
      if (userSubscription.useRole === 'READ_ONLY') {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }
      const task = await this.prisma.task.findUnique({
        where: { id: removeUserFromTaskDto.taskId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.workspaceId !== removeUserFromTaskDto.workspaceId) {
        throw new ForbiddenException('Task does not belong to this workspace');
      }

      const checkUser = await this.prisma.assignedToTask.findUnique({
        where: {
          userId_taskId: {
            userId: removeUserFromTaskDto.userId,
            taskId: removeUserFromTaskDto.taskId,
          },
        },
      });

      if (!checkUser) {
        throw new NotFoundException('Asignee not found');
      }
      await this.prisma.assignedToTask.delete({
        where: {
          userId_taskId: {
            userId: removeUserFromTaskDto.userId,
            taskId: removeUserFromTaskDto.taskId,
          },
        },
      });

      return { success: true, message: 'User unassigned from task' };
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
          // let taskDateId = currentTask.dateId;

          // // Update or create TaskDate
          // if (currentTask.dateId) {
          //   await tx.taskDate.update({
          //     where: { id: currentTask.dateId },
          //     data: {
          //       from: updateTaskDto.date.from,
          //       to: updateTaskDto.date.to,
          //     },
          //   });
          // } else {
          //   const newDate = await tx.taskDate.create({
          //     data: {
          //       from: updateTaskDto.date.from,
          //       to: updateTaskDto.date.to,
          //     },
          //   });
          //   taskDateId = newDate.id;
          // }

          const updated = await tx.task.update({
            where: { id: currentTask.id },
            data: {
              title: updateTaskDto.title,
              emoji: updateTaskDto.icon,
              content: updateTaskDto.content,
              date: updateTaskDto.date ?? null,
              projectId: updateTaskDto.projectId,
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

  async assignedToMe(
    workspaceId: number,
    userId: number,
    page: number = 1,
    limit: number,
  ) {
    const offset = (page - 1) * limit;

    // Fetching the assigned tasks
    const assignedTasks = await this.prisma.assignedToTask.findMany({
      where: {
        userId: userId,
        task: {
          workspaceId: workspaceId,
        },
      },
      orderBy: {
        task: {
          createdAt: 'desc',
        },
      },
      skip: offset,
      take: limit,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            emoji: true,
            date: true,

            createdAt: true,
            updatedAt: true,
            creator: {
              select: {
                name: true,
              },
            },
            project: {
              select: {
                title: true,
              },
            },
            AssignedToTask: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Modify the tasks with the required structure
    const modifiedTasks = assignedTasks.map((assignedTask) => ({
      id: assignedTask.task.id,
      title: assignedTask.task.title,
      emoji: assignedTask.task.emoji,
      from: assignedTask.task.date,
      createdAt: assignedTask.task.createdAt,
      updatedAt: assignedTask.task.updatedAt,
      creatorName: assignedTask.task.creator?.name || null,
      assignedTo:
        assignedTask.task.AssignedToTask.map(
          (assignment) => assignment.user?.name,
        ) || [],
    }));

    // Count the total tasks assigned to the user
    const totalTasks = await this.prisma.assignedToTask.count({
      where: {
        userId: userId,
        task: {
          workspaceId: workspaceId,
        },
      },
    });

    return {
      success: true,
      tasks: modifiedTasks,
      pagination: {
        totalTasks,
        page,
        totalPages: Math.ceil(totalTasks / limit),
      },
    };
  }
}
