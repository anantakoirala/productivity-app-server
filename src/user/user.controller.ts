import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/decorators/getUser';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: { userId: number },
  ) {
    return this.userService.saveUserImage(user.userId, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('delete-user-image')
  deleteUserImage(@GetUser() user: { userId: number }) {
    return this.userService.deleteUserImage(user.userId);
  }
}
