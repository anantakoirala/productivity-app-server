import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomColors } from '@prisma/client';
import { DeleteTagDto } from './dto/delete-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}
  async create(createTagDto: CreateTagDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: createTagDto.workspaceId },
        include: { tags: true },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: createTagDto.workspaceId },
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

      await this.prisma.tag.create({
        data: {
          name: createTagDto.name,
          workSpaceId: createTagDto.workspaceId,
          isActive: false,
          color: createTagDto.color as CustomColors,
        },
      });

      const updatedTags = await this.prisma.tag.findMany({
        where: { workSpaceId: createTagDto.workspaceId },
      });

      return { success: true, tags: updatedTags };
    } catch (error) {
      throw error;
    }
  }

  async deleteTag(deleteTagDto: DeleteTagDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: deleteTagDto.workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: deleteTagDto.workspaceId },
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

      const tag = await this.prisma.tag.findUnique({
        where: { id: deleteTagDto.id },
      });

      if (!tag || tag.workSpaceId !== deleteTagDto.workspaceId) {
        throw new ForbiddenException('Tag does not belong to this workspace');
      }

      await this.prisma.tag.delete({
        where: { id: deleteTagDto.id },
      });

      const updatedTags = await this.prisma.tag.findMany({
        where: { workSpaceId: deleteTagDto.workspaceId },
      });

      return { success: true, tags: updatedTags };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all tag`;
  }

  findOne(workspaceId: number) {
    try {
    } catch (error) {
      throw error;
    }
    return `This action returns a #${workspaceId} tag`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: number, updateTagDto: UpdateTagDto, userId: number) {
    try {
      const workspace = await this.prisma.workSpace.findFirst({
        where: { id: updateTagDto.workspaceId },
        include: { tags: true },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: updateTagDto.workspaceId },
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

      await this.prisma.tag.update({
        where: { id: id },
        data: {
          name: updateTagDto.name,
          color: updateTagDto.color as CustomColors,
        },
      });

      const updatedTags = await this.prisma.tag.findMany({
        where: { workSpaceId: updateTagDto.workspaceId },
      });

      return { success: true, tags: updatedTags };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
