import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdditionalResourceTypes } from '@prisma/client';
import { SocketGateway } from 'src/socket/socket-gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}
  async create(
    createChatDto: CreateChatDto,
    userId: number,
    files: Express.Multer.File[],
  ) {
    try {
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: createChatDto.workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }

      const chat = await this.prisma.conversation.findUnique({
        where: {
          id: createChatDto.chatId,
          workSpaceId: createChatDto.workspaceId,
        },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      const createdMessage = await this.prisma.message.create({
        data: {
          content: createChatDto.message,
          senderId: userId,
          conversationId: createChatDto.chatId,
        },
      });

      if (files && files.length > 0) {
        const additionalResources = files.map((file) => ({
          name: file.filename,
          type: this.getFileType(file.mimetype), // helper function below
          messageId: createdMessage.id,
        }));

        await this.prisma.additionalResource.createMany({
          data: additionalResources,
        });
      }

      const message = await this.prisma.message.findUnique({
        where: { id: createdMessage.id },
        include: {
          AdditionalResource: true,
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      this.socketGateway.emitMessage('new_message', {
        message: message,
        workspaceId: createChatDto.workspaceId, // Add workspaceId for room broadcasting
      });

      return { success: true, message };
    } catch (error) {
      throw error;
    }
  }

  getFileType(mimeType: string): AdditionalResourceTypes {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    // Add more cases as needed
    return 'UNKNOWN';
  }

  findAll() {
    return `This action returns all chat`;
  }

  async findOne(
    workspaceId: number,
    chatId: number,
    userId: number,
    pageNumber: number = 1,
  ) {
    try {
      const userSubscription = await this.prisma.subscription.findFirst({
        where: { userId: userId, workspaceId: workspaceId },
      });
      if (!userSubscription) {
        throw new ForbiddenException('Unauthorized');
      }
      const limit = 10;
      const skip = (pageNumber - 1) * limit;

      const conversation = await this.prisma.conversation.findUnique({
        where: {
          id: chatId,
          workSpaceId: workspaceId,
        },
        include: {
          Messages: {
            take: limit,
            skip: skip,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
              AdditionalResource: true,
            },
          },
        },
      });
      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      return { success: true, conversation };
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
