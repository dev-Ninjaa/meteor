import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { databaseConfig } from '../config';

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: NotificationsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        PrismaService,
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const mockResponse = {
        data: [
          {
            id: 'notif-id',
            type: 'TASK_PUBLISHED',
            title: 'Task Published',
            message: 'Your task has been published.',
            read: false,
            metadata: { taskId: 'task-id' },
            senderId: null,
            receiverId: 'user-id',
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      jest.spyOn(notificationsService, 'findNotifications').mockResolvedValue(mockResponse);

      const result = await controller.findAll('user-id', {});

      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      jest.spyOn(notificationsService, 'findUnreadCount').mockResolvedValue({ count: 5 });

      const result = await controller.getUnreadCount('user-id');

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const mockResponse = {
        id: 'notif-id',
        type: 'TASK_PUBLISHED',
        title: 'Task Published',
        message: 'Your task has been published.',
        read: true,
        metadata: { taskId: 'task-id' },
        senderId: null,
        receiverId: 'user-id',
        createdAt: new Date(),
      };

      jest.spyOn(notificationsService, 'markAsRead').mockResolvedValue(mockResponse);

      const result = await controller.markAsRead('user-id', 'notif-id');

      expect(result).toHaveProperty('read', true);
      expect(result).toHaveProperty('id', 'notif-id');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      jest.spyOn(notificationsService, 'markAllAsRead').mockResolvedValue({ count: 3 });

      const result = await controller.markAllAsRead('user-id');

      expect(result).toEqual({ count: 3 });
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      jest.spyOn(notificationsService, 'deleteNotification').mockResolvedValue();

      const result = await controller.remove('user-id', 'notif-id');

      expect(result).toEqual({ message: 'Notification deleted successfully' });
    });
  });
});
