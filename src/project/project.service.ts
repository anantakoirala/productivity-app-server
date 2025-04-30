import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeleteProjectDto } from './dto/delete-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async create(createProjectDto: CreateProjectDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: createProjectDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: createProjectDto.workspaceId },
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

      const project = await this.prisma.project.create({
        data: {
          title: createProjectDto.name,
          workSpaceId: createProjectDto.workspaceId,
        },
      });

      return { success: true, project };
    } catch (error) {}
  }

  findAll() {
    return `This action returns all project`;
  }

  async findOne(
    workspaceId: number,
    projectId: number,
    userId: number,
    page: number = 1,
    limit: number,
  ) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }

      const offset = (page - 1) * limit;
      const project = await this.prisma.project.findUnique({
        where: { id: projectId, workSpaceId: workspaceId },
        include: {
          tasks: {
            skip: offset,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              creator: {
                select: {
                  name: true,
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

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const modifiedTasks = project.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        emoji: task.emoji,
        from: task.date,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        creatorName: task.creator?.name || null,
        assignedTo:
          task.AssignedToTask.map((assignment) => assignment.user?.name) || [],
      }));

      // return project normally but replace tasks with modifiedTasks
      const modifiedProject = {
        ...project,
        tasks: modifiedTasks,
      };

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const totalTasks = await this.prisma.task.count({
        where: { projectId },
      });

      return {
        success: true,
        project: modifiedProject,
        pagination: {
          totalTasks,
          page,
          totalPages: Math.ceil(totalTasks / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(deleteProjectDto: DeleteProjectDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: deleteProjectDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: deleteProjectDto.workspaceId },
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

      await this.prisma.project.delete({
        where: {
          id: deleteProjectDto.projectId,
        },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: updateProjectDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: updateProjectDto.workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }
      if (userSubscription.useRole === 'READ_ONLY') {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const project = await this.prisma.project.findUnique({
        where: { id: id },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const updatedProject = await this.prisma.project.update({
        where: {
          id: id,
          workSpaceId: updateProjectDto.workspaceId,
        },
        data: {
          title: updateProjectDto.name,
        },
      });

      return { success: true, updatedProject };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
