import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { databaseConfig } from '../config';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [TasksController],
      providers: [
        TasksService,
        PrismaService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const mockResponse = {
        id: 'task-id',
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tokenAddress: null,
        status: 'DRAFT',
        aiGenerated: false,
        tags: ['frontend'],
        workersRequired: 1,
        workersJoined: 0,
        workersCompleted: 0,
        maxWorkers: 5,
        verificationMode: 'AI',
        submissionType: 'text',
        submissionOptions: [],
        allowAiVerification: true,
        manualVerificationRequired: false,
        escrowStatus: 'UNLOCKED',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tasksService, 'create').mockResolvedValue(mockResponse);

      const result = await controller.create('user-id', {
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tags: ['frontend'],
        workersRequired: 1,
        maxWorkers: 5,
      });

      expect(result).toHaveProperty('id', 'task-id');
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      jest.spyOn(tasksService, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toHaveProperty('total', 0);
      expect(result).toHaveProperty('page', 1);
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      const mockResponse = {
        id: 'task-id',
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tokenAddress: null,
        status: 'OPEN',
        aiGenerated: false,
        tags: ['frontend'],
        workersRequired: 1,
        workersJoined: 0,
        workersCompleted: 0,
        maxWorkers: 5,
        verificationMode: 'AI',
        submissionType: 'text',
        submissionOptions: [],
        allowAiVerification: true,
        manualVerificationRequired: false,
        escrowStatus: 'UNLOCKED',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(tasksService, 'findOne').mockResolvedValue(mockResponse);

      const result = await controller.findOne('task-id');

      expect(result).toHaveProperty('id', 'task-id');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      jest.spyOn(tasksService, 'update').mockResolvedValue({
        id: 'task-id',
        title: 'Updated',
        description: 'Updated description',
        reward: '0.1',
        tokenAddress: null,
        status: 'OPEN',
        aiGenerated: false,
        tags: ['frontend'],
        workersRequired: 1,
        workersJoined: 0,
        workersCompleted: 0,
        maxWorkers: 5,
        verificationMode: 'AI',
        submissionType: 'text',
        submissionOptions: [],
        allowAiVerification: true,
        manualVerificationRequired: false,
        escrowStatus: 'UNLOCKED',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.update('user-id', 'task-id', { title: 'Updated' });

      expect(result).toHaveProperty('title', 'Updated');
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      jest.spyOn(tasksService, 'remove').mockResolvedValue();

      const result = await controller.remove('user-id', 'task-id');

      expect(result).toEqual({ message: 'Task deleted successfully' });
    });
  });

  describe('publish', () => {
    it('should publish a task', async () => {
      jest.spyOn(tasksService, 'publish').mockResolvedValue({
        id: 'task-id',
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tokenAddress: null,
        status: 'OPEN',
        aiGenerated: false,
        tags: ['frontend'],
        workersRequired: 1,
        workersJoined: 0,
        workersCompleted: 0,
        maxWorkers: 5,
        verificationMode: 'AI',
        submissionType: 'text',
        submissionOptions: [],
        allowAiVerification: true,
        manualVerificationRequired: false,
        escrowStatus: 'UNLOCKED',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        escrowData: {
          taskId: 'task-id',
          rewardPerWorker: '0.1',
          maxWorkers: 5,
          totalAmount: '0.5',
          escrowContractAddress: '0x1234567890abcdef',
        },
      });

      const result = await controller.publish('user-id', 'task-id');

      expect(result).toHaveProperty('status', 'OPEN');
      expect(result).toHaveProperty('escrowData');
    });
  });

  describe('cancel', () => {
    it('should cancel a task', async () => {
      jest.spyOn(tasksService, 'cancel').mockResolvedValue({
        id: 'task-id',
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tokenAddress: null,
        status: 'CANCELLED',
        aiGenerated: false,
        tags: ['frontend'],
        workersRequired: 1,
        workersJoined: 0,
        workersCompleted: 0,
        maxWorkers: 5,
        verificationMode: 'AI',
        submissionType: 'text',
        submissionOptions: [],
        allowAiVerification: true,
        manualVerificationRequired: false,
        escrowStatus: 'UNLOCKED',
        createdById: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.cancel('user-id', 'task-id');

      expect(result).toHaveProperty('status', 'CANCELLED');
    });
  });

  describe('join', () => {
    it('should join a task', async () => {
      jest.spyOn(tasksService, 'join').mockResolvedValue();

      const result = await controller.join('user-id', 'task-id');

      expect(result).toEqual({ message: 'Joined task successfully' });
    });
  });

  describe('leave', () => {
    it('should leave a task', async () => {
      jest.spyOn(tasksService, 'leave').mockResolvedValue();

      const result = await controller.leave('user-id', 'task-id');

      expect(result).toEqual({ message: 'Left task successfully' });
    });
  });
});
