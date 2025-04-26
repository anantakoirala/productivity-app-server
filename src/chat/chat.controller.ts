import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/getUser';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer.config';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  create(
    @Body() createChatDto: CreateChatDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: { userId: number },
  ) {
    if (files.length > 5) {
      throw new BadRequestException('You can only upload up to 5 files.');
    }
    return this.chatService.create(createChatDto, user.userId, files);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':workspaceId/:chatId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('chatId') chatId: string,
    @Query('page') page: string = '1',
    @GetUser() user: { userId: number },
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    return this.chatService.findOne(
      +workspaceId,
      +chatId,
      user.userId,
      pageNumber,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
