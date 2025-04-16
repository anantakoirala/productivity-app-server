import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMindMapDto } from './dto/create-mindmap.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateMindMapDto } from './dto/update-mindmap.dto';
import { UpdateMindMapTagsDto } from './dto/update-mindmap-tags.dto';
import { UpdateMindMapInfoDto } from './dto/update-mindmap-info.dto';
import { AssignUserToMindmapDto } from './dto/assign-user-to-mindmap';
import { RemoveUserFromMindmapDto } from './dto/remove-user-from-mindmap.dto';

@Injectable()
export class MindmapService {
  constructor(private prisma: PrismaService) {}
  async create(createMindmapDto: CreateMindMapDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: createMindmapDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: createMindmapDto.workspaceId },
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

      const mindMap = await this.prisma.mindMap.create({
        data: {
          title: 'asdf',
          workSpaceId: createMindmapDto.workspaceId,
          creatorId: userId,
        },
      });

      return { success: true, mindmap: mindMap };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all mindmap`;
  }

  async findOne(workspaceId: number, mindMapId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const mindMap = await this.prisma.mindMap.findUnique({
        where: { id: mindMapId, workSpaceId: workspaceId },
        include: {
          MindMapTag: {
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
          AssignedToMindmap: {
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

      const modifiedMindMap = {
        ...mindMap,
        MindMapTag: mindMap.MindMapTag.map((mapTag) => mapTag.tag),
      };

      if (!mindMap) {
        throw new NotFoundException('MindMap not found');
      }

      return { success: true, mindmap: modifiedMindMap };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateMindmapDto: UpdateMindMapDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: updateMindmapDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: updateMindmapDto.workspaceId },
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

      const mindMap = await this.prisma.mindMap.findUnique({
        where: { id: id },
      });
      if (!mindMap) {
        throw new NotFoundException('Mindmap not found');
      }

      const updatedMindMap = await this.prisma.mindMap.update({
        where: { id: id },
        data: {
          content: updateMindmapDto.content,
          updatedUserId: userId,
        },
        include: {
          MindMapTag: {
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

      const modifiedMindMap = {
        ...updatedMindMap,
        MindMapTag: updatedMindMap.MindMapTag.map((mapTag) => mapTag.tag),
      };

      return { success: true, mindmap: modifiedMindMap };
    } catch (error) {
      throw error;
    }
  }

  async updateMindmapInfo(
    workspaceId: number,
    mindMapId: number,
    updateMindMapInfoDto: UpdateMindMapInfoDto,
    userId: number,
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

      if (
        userSubscription.useRole === 'CAN_EDIT' ||
        userSubscription.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const mindMap = await this.prisma.mindMap.findUnique({
        where: { id: mindMapId },
      });
      if (!mindMap) {
        throw new NotFoundException('Mindmap not found');
      }
      const updatedMindMap = await this.prisma.mindMap.update({
        where: { id: mindMapId },
        data: {
          emoji: updateMindMapInfoDto.emoji,
          title: updateMindMapInfoDto.title,
          updatedUserId: userId,
        },
        include: {
          MindMapTag: {
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

      const modifiedMindMap = {
        ...updatedMindMap,
        MindMapTag: updatedMindMap.MindMapTag.map((mapTag) => mapTag.tag),
      };

      return { success: true, mindmap: modifiedMindMap };
    } catch (error) {
      throw error;
    }
  }

  async updateMindmapTags(
    workspaceId: number,
    mindMapId: number,
    updateMindMapTagsDto: UpdateMindMapTagsDto,
    userId: number,
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

      if (
        userSubscription.useRole === 'CAN_EDIT' ||
        userSubscription.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const currentMindmap = await this.prisma.mindMap.findUnique({
        where: { id: mindMapId },
        include: {
          MindMapTag: {
            select: {
              tagId: true,
            },
          },
        },
      });

      if (!currentMindmap) {
        throw new NotFoundException('Mindmap not found');
      }

      const currentTagIds = currentMindmap.MindMapTag.map((tt) => tt.tagId);
      const tagsToDisconnect = currentTagIds.filter(
        (tagId) => !updateMindMapTagsDto.activeTagIds.includes(tagId),
      );
      const tagsToConnect = updateMindMapTagsDto.activeTagIds.filter(
        (tagId) => !currentTagIds.includes(tagId),
      );

      const updatedMindMap = await this.prisma.$transaction(
        async (tx) => {
          const updated = await tx.mindMap.update({
            where: { id: currentMindmap.id },
            data: {
              MindMapTag: {
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
              MindMapTag: {
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
      const modifiedMindMap = {
        ...updatedMindMap,
        MindMapTag: updatedMindMap.MindMapTag.map((mapTag) => mapTag.tag),
      };
      return { success: true, mindmap: modifiedMindMap };
    } catch (error) {
      throw error;
    }
  }

  async remove(workspaceId: number, mindMapId: number, userId: number) {
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

      if (
        userSubscription.useRole === 'CAN_EDIT' ||
        userSubscription.useRole === 'READ_ONLY'
      ) {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const currentMindmap = await this.prisma.mindMap.findUnique({
        where: { id: mindMapId, workSpaceId: workspaceId },
      });

      if (!currentMindmap) {
        throw new NotFoundException('Mindmap not found');
      }

      await this.prisma.mindMap.delete({
        where: { id: mindMapId, workSpaceId: workspaceId },
      });

      return { success: true, message: 'Mindmap deleted successfully' };
    } catch (error) {
      console.log(error);
    }
  }

  async assignUserToMindmap(
    assignUserToMindmapDto: AssignUserToMindmapDto,
    userId: number,
  ) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: assignUserToMindmapDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: userId,
          workspaceId: assignUserToMindmapDto.workspaceId,
        },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }

      if (userSubscription.useRole === 'READ_ONLY') {
        throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
      }

      const task = await this.prisma.mindMap.findUnique({
        where: { id: assignUserToMindmapDto.mindmapId },
      });
      if (!task) {
        throw new NotFoundException('Mindmap not found');
      }
      const userToAssign = await this.prisma.user.findUnique({
        where: { id: assignUserToMindmapDto.userId },
      });

      if (!userToAssign) {
        throw new NotFoundException('User to assign not found');
      }

      const existingAssignment = await this.prisma.assignedToMindmap.findUnique(
        {
          where: {
            userId_mindmapId: {
              userId: assignUserToMindmapDto.userId,
              mindmapId: assignUserToMindmapDto.mindmapId,
            },
          },
        },
      );
      if (existingAssignment) {
        throw new ConflictException('User already assigned to this task');
      }

      const assignment = await this.prisma.assignedToMindmap.create({
        data: {
          userId: assignUserToMindmapDto.userId,
          mindmapId: assignUserToMindmapDto.mindmapId,
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
    } catch (error) {
      throw error;
    }
  }
  async removeUserFromMindmap(
    removeUserFromMindmapDto: RemoveUserFromMindmapDto,
    userId: number,
  ) {
    const workspace = await this.prisma.workSpace.findFirst({
      where: { id: removeUserFromMindmapDto.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const userSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: userId,
        workspaceId: removeUserFromMindmapDto.workspaceId,
      },
    });
    if (!userSubscription) {
      throw new ForbiddenException('Unauthorized');
    }
    if (userSubscription.useRole === 'READ_ONLY') {
      throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
    }
    const mindmap = await this.prisma.mindMap.findUnique({
      where: { id: removeUserFromMindmapDto.mindmapId },
    });

    if (!mindmap) {
      throw new NotFoundException('Mindmap not found');
    }

    if (mindmap.workSpaceId !== removeUserFromMindmapDto.workspaceId) {
      throw new ForbiddenException('Mindmap does not belong to this workspace');
    }

    const checkUser = await this.prisma.assignedToMindmap.findUnique({
      where: {
        userId_mindmapId: {
          userId: removeUserFromMindmapDto.userId,
          mindmapId: removeUserFromMindmapDto.mindmapId,
        },
      },
    });

    if (!checkUser) {
      throw new NotFoundException('Asignee not found');
    }
    await this.prisma.assignedToMindmap.delete({
      where: {
        userId_mindmapId: {
          userId: removeUserFromMindmapDto.userId,
          mindmapId: removeUserFromMindmapDto.mindmapId,
        },
      },
    });

    return { success: true, message: 'User unassigned from mindmap' };
    try {
    } catch (error) {}
  }
}
