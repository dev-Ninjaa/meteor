import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { EventEmitterService, AppEvent } from './event-emitter.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@Injectable()
@WSGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebSocketGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');
    this.setupEventListeners();
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id} (user: ${client.userId})`);
  }

  @SubscribeMessage('subscribe:user')
  handleSubscribeUser(client: AuthenticatedSocket, userId: string): void {
    if (client.userId !== userId) {
      client.emit('error', { message: "Cannot subscribe to another user's events" });
      return;
    }
    client.join(`user:${userId}`);
  }

  @SubscribeMessage('unsubscribe:user')
  handleUnsubscribeUser(client: AuthenticatedSocket, userId: string): void {
    if (client.userId !== userId) {
      client.emit('error', { message: "Cannot unsubscribe from another user's events" });
      return;
    }
    client.leave(`user:${userId}`);
  }

  @SubscribeMessage('subscribe:task')
  handleSubscribeTask(client: AuthenticatedSocket, taskId: string): void {
    client.join(`task:${taskId}`);
  }

  @SubscribeMessage('unsubscribe:task')
  handleUnsubscribeTask(client: AuthenticatedSocket, taskId: string): void {
    client.leave(`task:${taskId}`);
  }

  private setupEventListeners(): void {
    const taskEvents = [
      'task.created',
      'task.updated',
      'task.published',
      'task.cancelled',
      'task.joined',
      'task.left',
      'submission.created',
      'submission.approved',
      'submission.rejected',
      'verification.completed',
    ];

    for (const event of taskEvents) {
      this.eventEmitter.on(event, (payload: AppEvent) => {
        const taskId = payload.data?.taskId as string | undefined;
        if (taskId) {
          this.broadcastToTask(taskId, event, payload.data);
        }
      });
    }

    // Public feed events - broadcast to all connected clients so the
    // marketplace list and dashboards update without per-task subscriptions.
    const publicFeedEvents = ['task.created', 'task.published', 'task.cancelled'];

    for (const event of publicFeedEvents) {
      this.eventEmitter.on(event, (payload: AppEvent) => {
        this.server.emit(event, payload.data);
      });
    }

    const escrowEvents = ['escrow.locked', 'escrow.released', 'escrow.refunded'];

    for (const event of escrowEvents) {
      this.eventEmitter.on(event, (payload: AppEvent) => {
        const taskId = payload.data?.taskId as string | undefined;
        const userId = payload.data?.userId as string | undefined;
        if (taskId) {
          this.broadcastToTask(taskId, event, payload.data);
        }
        if (userId) {
          this.broadcastToUser(userId, event, payload.data);
        }
      });
    }

    this.eventEmitter.on('notification.created', (payload: AppEvent) => {
      const userId = payload.data?.userId as string | undefined;
      if (userId) {
        this.broadcastToUser(userId, 'notification.created', payload.data);
      }
    });
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth?.token;
    if (auth) return auth;

    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return undefined;
  }

  broadcastToTask(taskId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`task:${taskId}`).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
