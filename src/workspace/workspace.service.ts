import { Injectable, NotFoundException } from '@nestjs/common';
//import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateWorkspaceImageDto } from './dto/upload-workspace-image.dto';
import { UpdateWorkSpaceDto } from './dto/update-workspace.dto';
import { DeleteWorkspaceDto } from './dto/deleteWorkspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}
  async create(
    createWorkspaceDto: CreateWorkSpaceDto,
    userId: number,
    file: any,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const transaction = await this.prisma.$transaction(async (prisma) => {
        const workspace = await prisma.workSpace.create({
          data: {
            name: createWorkspaceDto.workspacename,
            userId: userId,
            image: file ? file.filename : null, // ✅ Assign filename if file exists
          },
        });

        await prisma.subscription.create({
          data: {
            userId: userId,
            workspaceId: workspace.id,
            useRole: 'ADMIN',
          },
        });
        return workspace;
      });

      return { success: true, workspace: transaction };
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: number) {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: { userId: userId },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const myworkspaces = subscriptions.map((sub) => sub.workspace);

      const myworkspacesAsAdmin = subscriptions
        .filter((sub) => sub.useRole === 'ADMIN')
        .map((sub) => sub.workspace);

      return { success: true, workspaces: myworkspaces, myworkspacesAsAdmin };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id, userId: userId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      return { success: true, workspace };
    } catch (error) {
      throw error;
    }
  }

  async getWorkspaceSettingDetail(id: number, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      return { success: true, workspace };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkSpaceDto) {
    try {
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: id },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const updatedWorkspace = await this.prisma.workSpace.update({
        where: { id: id },
        data: {
          name: updateWorkspaceDto.name,
        },
      });

      return {
        success: true,
        message: 'Workspace updated successfully',
        updatedWorkspace,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }

  async deleteWorkspace(deleteWorkspaceDto: DeleteWorkspaceDto) {
    try {
      const workspace = await this.prisma.workSpace.findUnique({
        where: {
          id: deleteWorkspaceDto.workspaceId,
          name: deleteWorkspaceDto.workspaceName,
        },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      await this.prisma.workSpace.delete({
        where: { id: deleteWorkspaceDto.workspaceId },
      });
      return { success: true, message: 'Workspace deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async saveWorkspaceImage(
    updateWorkspaceImageDto: UpdateWorkspaceImageDto,
    userId: number,
    file: any,
  ) {
    try {
      console.log('file', file);
      const workspace = await this.prisma.workSpace.findUnique({
        where: { id: +updateWorkspaceImageDto.workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (!file) {
        throw new NotFoundException('File not found');
      }

      if (workspace.image) {
        const imagePath = path.join(process.cwd(), 'uploads', workspace.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const updatedWorkspace = await this.prisma.workSpace.update({
        where: { id: +updateWorkspaceImageDto.workspaceId },
        data: { image: file.filename },
      });

      return {
        success: true,
        message: 'Image saved',
        updatedWorkspace,
      };
    } catch (error) {
      throw error;
    }
  }
}
