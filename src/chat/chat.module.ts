import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SocketGateway } from 'src/socket/socket-gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService, SocketGateway],
})
export class ChatModule {}
