import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './notification-types';
import { databaseConfig } from '../config';

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

function createMockNotification(
  overrides: Partial<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    metadata: Prisma.JsonValue;
    senderId: string | null;
    receiverId: string;
    createdAt: Date;
  }> = {},
) {
  return {
    id: 'notif-id',
    type: 'TASK_PUBLISHED',
    title: 'Task Published',
    message: 'Test',
    read: false,
    metadata: {},
    senderId: null,
    receiverId: 'user-id',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [
        NotificationsService,
        PrismaService,
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('createNotification', () => {
    it('should create a single notification', async () => {
      const mockNotification = createMockNotification({
        receiverId: 'receiver-id',
      });

      jest.spyOn(prisma.notification, 'create').mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        receiverId: 'receiver-id',
        type: NotificationType.TASK_PUBLISHED,
        title: 'Task Published',
        message: 'Your task has been published.',
        metadata: { taskId: 'task-id' },
      });

      expect(result).toHaveProperty('id', 'notif-id');
      expect(result).toHaveProperty('type', 'TASK_PUBLISHED');
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('should create a notification with sender', async () => {
      const mockNotification = createMockNotification({
        senderId: 'sender-id',
        receiverId: 'receiver-id',
      });

      jest.spyOn(prisma.notification, 'create').mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        senderId: 'sender-id',
        receiverId: 'receiver-id',
        type: NotificationType.TASK_JOINED,
        title: 'Worker Joined',
        message: 'A worker joined your task.',
      });

      expect(result).toHaveProperty('senderId', 'sender-id');
    });
  });

  describe('createManyNotifications', () => {
    it('should create multiple notifications', async () => {
      jest.spyOn(prisma.notification, 'createMany').mockResolvedValue({ count: 3 });

      const result = await service.createManyNotifications([
        {
          receiverId: 'user-1',
          type: NotificationType.TASK_PUBLISHED,
          title: 'Task Published',
          message: 'Your task has been published.',
        },
        {
          receiverId: 'user-2',
          type: NotificationType.TASK_CANCELLED,
          title: 'Task Cancelled',
          message: 'Your task has been cancelled.',
        },
        {
          receiverId: 'user-3',
          type: NotificationType.ESCROW_LOCKED,
          title: 'Escrow Locked',
          message: 'Escrow has been locked.',
        },
      ]);

      expect(result).toBe(3);
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ receiverId: 'user-1' }),
          expect.objectContaining({ receiverId: 'user-2' }),
          expect.objectContaining({ receiverId: 'user-3' }),
        ]),
      });
    });
  });

  describe('findNotifications', () => {
    it('should return paginated notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'TASK_PUBLISHED',
          title: 'Task Published',
          message: 'Test',
          read: false,
          metadata: {},
          senderId: null,
          receiverId: 'user-id',
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue(mockNotifications);
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(1);

      const result = await service.findNotifications('user-id', {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by unreadOnly', async () => {
      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(0);

      await service.findNotifications('user-id', { unreadOnly: true });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ read: false }),
        }),
      );
    });

    it('should filter by type', async () => {
      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(0);

      await service.findNotifications('user-id', { type: 'TASK_PUBLISHED' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'TASK_PUBLISHED' }),
        }),
      );
    });

    it('should order by newest first', async () => {
      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(0);

      await service.findNotifications('user-id', {});

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findUnreadCount', () => {
    it('should return unread count', async () => {
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(5);

      const result = await service.findUnreadCount('user-id');

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { receiverId: 'user-id', read: false },
        }),
      );
    });

    it('should return zero when no unread notifications', async () => {
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(0);

      const result = await service.findUnreadCount('user-id');

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockNotification = {
        id: 'notif-id',
        type: 'TASK_PUBLISHED',
        title: 'Task Published',
        message: 'Test',
        read: false,
        metadata: {},
        senderId: null,
        receiverId: 'user-id',
        createdAt: new Date(),
      };

      const mockUpdated = { ...mockNotification, read: true };

      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification);
      jest.spyOn(prisma.notification, 'update').mockResolvedValue(mockUpdated);

      const result = await service.markAsRead('user-id', 'notif-id');

      expect(result).toHaveProperty('read', true);
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif-id' },
          data: { read: true },
        }),
      );
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(null);

      await expect(service.markAsRead('user-id', 'non-existent')).rejects.toThrow(
        'Notification not found',
      );
    });

    it('should throw ForbiddenException when marking another user notification', async () => {
      const mockNotification = createMockNotification({ receiverId: 'other-user' });

      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification);

      await expect(service.markAsRead('user-id', 'notif-id')).rejects.toThrow(
        "Cannot mark another user's notification as read",
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for the user', async () => {
      jest.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-id');

      expect(result).toEqual({ count: 3 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { receiverId: 'user-id', read: false },
          data: { read: true },
        }),
      );
    });

    it('should return zero when no unread notifications', async () => {
      jest.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead('user-id');

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const mockNotification = createMockNotification();

      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification);
      jest.spyOn(prisma.notification, 'delete').mockResolvedValue(mockNotification);

      await service.deleteNotification('user-id', 'notif-id');

      expect(prisma.notification.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif-id' },
        }),
      );
    });

    it('should throw NotFoundException when notification does not exist', async () => {
      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteNotification('user-id', 'non-existent')).rejects.toThrow(
        'Notification not found',
      );
    });

    it('should throw ForbiddenException when deleting another user notification', async () => {
      const mockNotification = createMockNotification({ receiverId: 'other-user' });

      jest.spyOn(prisma.notification, 'findUnique').mockResolvedValue(mockNotification);

      await expect(service.deleteNotification('user-id', 'notif-id')).rejects.toThrow(
        "Cannot delete another user's notification",
      );
    });
  });
});
