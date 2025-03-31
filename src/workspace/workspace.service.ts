import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
          },
        });
        return workspace;
      });

      return { success: true, user: transaction };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all workspace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
