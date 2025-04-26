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

      const modifiedTasks = project.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        emoji: task.emoji,
        from: task.from,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        creatorName: task.creator?.name || null,
        assignedTo:
          task.AssignedToTask.map((assignment) => assignment.user?.name) || [],
      }));

      // ✅ return project normally but replace tasks with modifiedTasks
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

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
