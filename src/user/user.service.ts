import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

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
      console.log('delete image');
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
}
