import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { CreateWorkSpaceDto } from './dto/workspace.dto';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { ChangePasswordDto } from './dto/changePasswordSchema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async saveUserImage(userId: number, file: any) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }

      if (user.image) {
        const imagePath = path.join(process.cwd(), 'uploads', user.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { image: file.filename },
      });

      return {
        success: true,
        message: 'Image saved',
        image: updatedUser.image,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserImage(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      const userImage = user.image;
      if (!userImage) {
        throw new BadRequestException('Image not found');
      }

      if (userImage) {
        const imagePath = path.join(process.cwd(), 'uploads', userImage);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          image: null,
        },
      });

      return {
        success: true,
        message: 'Image deleted succesfully',
        user: updatedUser,
      };
    } catch (error) {
      console.log('delete user image error', error);
      throw error;
    }
  }

  async createWorkspace(
    userId: number,
    file: any,
    createWorkSpaceData: CreateWorkSpaceDto,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      if (user.completeOnBoarding === true) {
        throw new BadRequestException('Process is already completed');
      }
      const transaction = await this.prisma.$transaction(async (prisma) => {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            completeOnBoarding: true,
            name: createWorkSpaceData.name,
            useCase: createWorkSpaceData.useCase,
          },
          select: {
            id: true,
            name: true,
            email: true,
            completeOnBoarding: true,
            useCase: true,
            username: true,
          },
        });
        const workspace = await prisma.workSpace.create({
          data: {
            name: createWorkSpaceData.workspacename,
            userId: userId,
            image: file ? file.filename : null,
            inviteCode: uuidv4(),
            adminCode: uuidv4(),
            canEditCode: uuidv4(),
            readOnlyCode: uuidv4(),
          },
        });

        //  Create the conversation for this workspace
        await prisma.conversation.create({
          data: {
            workSpaceId: workspace.id,
          },
        });

        await prisma.subscription.create({
          data: {
            userId: userId,
            workspaceId: workspace.id,
            useRole: 'ADMIN',
          },
        });
        return updatedUser;
      });
      //const { password, ...remainingUserField } = transaction;
      return { success: true, user: transaction };
    } catch (error) {
      throw error;
    }
  }

  async updateUserInfo(updateUserInfoDto: UpdateUserInfoDto, userId: number) {
    try {
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: updateUserInfoDto.name,
          username: updateUserInfoDto.username,
        },
        select: {
          id: true,
          name: true,
          email: true,
          completeOnBoarding: true,
          useCase: true,
          username: true,
        },
      });
      return { success: true, user: updateUser };
    } catch (error) {
      throw error;
    }
  }
  async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      console.log('changePasswordDto', changePasswordDto);
      const saltOrRounds = 10;
      const password = changePasswordDto.new_password;
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);

      const matchPassword = await bcrypt.compare(
        changePasswordDto.current_password,
        user.password,
      );
      if (!matchPassword) {
        throw new BadRequestException('Current password doesnot match');
      }
      const updateUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          completeOnBoarding: true,
          useCase: true,
          username: true,
        },
      });
      return { success: true, user: updateUser };
    } catch (error) {
      throw error;
    }
  }
}
