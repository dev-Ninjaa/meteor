import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationType } from './notification-types';

export interface CreateNotificationInput {
  senderId?: string;
  receiverId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createNotification(input: CreateNotificationInput): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: {
        senderId: input.senderId ?? null,
        receiverId: input.receiverId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    this.eventEmitter.emit('notification.created', {
      userId: input.receiverId,
      notification: this.mapNotificationResponse(notification),
    });

    return this.mapNotificationResponse(notification);
  }

  async createManyNotifications(inputs: CreateNotificationInput[]): Promise<number> {
    const data = inputs.map((input) => ({
      senderId: input.senderId ?? null,
      receiverId: input.receiverId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    }));

    const result = await this.prisma.notification.createMany({ data });

    return result.count;
  }

  async findNotifications(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<{
    data: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      receiverId: userId,
    };

    if (query.unreadOnly) {
      where.read = false;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: data.map(this.mapNotificationResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });

    return { count };
  }

  async markAsRead(userId: string, id: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.receiverId !== userId) {
      throw new ForbiddenException("Cannot mark another user's notification as read");
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return this.mapNotificationResponse(updated);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    return { count: result.count };
  }

  async deleteNotification(userId: string, id: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.receiverId !== userId) {
      throw new ForbiddenException("Cannot delete another user's notification");
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    this.logger.log(`Notification deleted: ${id}`);
  }

  private mapNotificationResponse(notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    metadata: Prisma.JsonValue;
    senderId: string | null;
    receiverId: string;
    createdAt: Date;
  }): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata as Record<string, unknown> | undefined,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
      createdAt: notification.createdAt,
    };
  }
}
