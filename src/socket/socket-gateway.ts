// socket.gateway.ts

import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000'; // Get client_url from environment variables
      if (origin === allowedOrigin) {
        callback(null, true); // Accept the connection
      } else {
        callback(new Error('Not allowed by CORS')); // Reject the connection
      }
    },
    credentials: true, // Allow credentials (cookies, etc.)
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  async getRoomUserCount(room: string): Promise<number> {
    const sockets = await this.server.in(room).fetchSockets(); // This returns all sockets in the room
    return sockets.length;
  }

  // Get rooms user
  @SubscribeMessage('get_room_users')
  async handleGetRoomUsers(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const count = await this.getRoomUserCount(data.workspaceId);
    client.emit('room_user_count', { workspaceId: data.workspaceId, count });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { workspaceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.workspaceId);
    console.log(`Client ${client.id} joined room ${data.workspaceId}`);
    client.emit('room_joined', {
      success: true,
      workspaceId: data.workspaceId,
    });
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @MessageBody() data: { workspaceId: string; message: string },
  ) {
    console.log('message received workspace id', data.message);
  }

  emitMessage(event: string, payload: any) {
    const { workspaceId, ...messageData } = payload;

    if (!workspaceId) {
      console.error('Missing workspaceId in emitMessage payload');
      return;
    }

    this.server.to(workspaceId).emit(event, messageData); // emit to room only
  }
}
