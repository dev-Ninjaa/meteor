import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Paginated notification list',
    schema: {
      example: {
        data: [
          {
            id: 'notif-uuid',
            type: 'TASK_PUBLISHED',
            title: 'Task Published',
            message: 'Your task "Build a landing page" has been published.',
            read: false,
            metadata: { taskId: 'task-uuid' },
            senderId: null,
            receiverId: 'user-uuid',
            createdAt: '2026-07-29T12:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'unreadOnly', required: false, example: true })
  @ApiQuery({ name: 'type', required: false, example: 'TASK_PUBLISHED' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryNotificationsDto,
  ): Promise<{
    data: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.notificationsService.findNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread count',
    schema: {
      example: { count: 5 },
    },
  })
  async getUnreadCount(@CurrentUser('sub') userId: string): Promise<{ count: number }> {
    return this.notificationsService.findUnreadCount(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
    schema: {
      example: {
        id: 'notif-uuid',
        type: 'TASK_PUBLISHED',
        title: 'Task Published',
        message: 'Your task "Build a landing page" has been published.',
        read: true,
        metadata: { taskId: 'task-uuid' },
        senderId: null,
        receiverId: 'user-uuid',
        createdAt: '2026-07-29T12:00:00.000Z',
      },
    },
  })
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      example: { count: 3 },
    },
  })
  async markAllAsRead(@CurrentUser('sub') userId: string): Promise<{ count: number }> {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
    schema: {
      example: { message: 'Notification deleted successfully' },
    },
  })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.deleteNotification(userId, id);
    return { message: 'Notification deleted successfully' };
  }
}
