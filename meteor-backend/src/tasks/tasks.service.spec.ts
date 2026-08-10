import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import {
  Prisma,
  TaskStatus,
  VerificationMode,
  EscrowStatus,
  TaskWorker,
  Submission,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { TasksService } from './tasks.service';
import { databaseConfig } from '../config';
import { CreateTaskDto } from './dto/create-task.dto';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

function createMockTask(
  overrides: Partial<{
    id: string;
    title: string;
    description: string;
    reward: Prisma.Decimal;
    tokenAddress: string | null;
    status: TaskStatus;
    aiGenerated: boolean;
    aiPrompt: string | null;
    tags: string[];
    workersRequired: number;
    workersJoined: number;
    workersCompleted: number;
    maxWorkers: number;
    verificationMode: VerificationMode;
    allowAiVerification: boolean;
    manualVerificationRequired: boolean;
    escrowStatus: EscrowStatus;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> = {},
) {
  return {
    id: 'task-id',
    title: 'Build a landing page',
    description: 'Create a responsive landing page',
    reward: new Prisma.Decimal('0.1'),
    tokenAddress: null,
    status: 'DRAFT' as TaskStatus,
    aiGenerated: false,
    aiPrompt: null,
    tags: ['frontend', 'react'],
    workersRequired: 1,
    workersJoined: 0,
    workersCompleted: 0,
    maxWorkers: 5,
    verificationMode: 'AI' as VerificationMode,
    submissionType: 'text',
    submissionOptions: [],
    attachments: null,
    allowAiVerification: true,
    manualVerificationRequired: false,
    escrowStatus: 'UNLOCKED' as EscrowStatus,
    createdById: 'creator-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('TasksService', () => {
  let service: TasksService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [
        TasksService,
        PrismaService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'create').mockResolvedValue(mockTask);

      const result = await service.create('creator-id', {
        title: 'Build a landing page',
        description: 'Create a responsive landing page',
        reward: '0.1',
        tags: ['frontend', 'react'],
        workersRequired: 1,
        maxWorkers: 5,
      } as CreateTaskDto);

      expect(result).toHaveProperty('id', 'task-id');
      expect(result).toHaveProperty('title', 'Build a landing page');
      expect(result).toHaveProperty('reward', '0.1');
      expect(prisma.task.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([mockTask]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([mockTask]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(1);

      await service.findAll({ status: 'DRAFT' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      const result = await service.findOne('task-id');

      expect(result).toHaveProperty('id', 'task-id');
    });

    it('should throw NotFoundException for deleted task', async () => {
      const mockTask = createMockTask({ deletedAt: new Date() });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.findOne('task-id')).rejects.toThrow('Task not found');
    });

    it('should throw NotFoundException for non-existent task', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow('Task not found');
    });
  });

  describe('update', () => {
    it('should update a task when user is creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.task, 'update')
        .mockResolvedValue(createMockTask({ title: 'Updated title' }));

      const result = await service.update('creator-id', 'task-id', { title: 'Updated title' });

      expect(result).toHaveProperty('title', 'Updated title');
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.update('other-user', 'task-id', { title: 'Hacked' })).rejects.toThrow(
        'Only the task creator can update this task',
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a task when user is creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.task, 'update')
        .mockResolvedValue(createMockTask({ deletedAt: new Date() }));

      await service.remove('creator-id', 'task-id');

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.remove('other-user', 'task-id')).rejects.toThrow(
        'Only the task creator can delete this task',
      );
    });
  });

  describe('publish', () => {
    it('should publish a draft task', async () => {
      const draftTask = createMockTask({ status: 'DRAFT' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(draftTask);
      jest
        .spyOn(prisma.task, 'update')
        .mockResolvedValue(createMockTask({ status: 'OPEN' as TaskStatus }));

      const result = await service.publish('creator-id', 'task-id');

      expect(result).toHaveProperty('status', 'OPEN');
    });

    it('should throw when publishing a non-draft task', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);

      await expect(service.publish('creator-id', 'task-id')).rejects.toThrow(
        'Only draft tasks can be published',
      );
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.publish('other-user', 'task-id')).rejects.toThrow(
        'Only the task creator can publish this task',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel an open task', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest
        .spyOn(prisma.task, 'update')
        .mockResolvedValue(createMockTask({ status: 'CANCELLED' as TaskStatus }));

      const result = await service.cancel('creator-id', 'task-id');

      expect(result).toHaveProperty('status', 'CANCELLED');
    });

    it('should throw when cancelling a completed task', async () => {
      const completedTask = createMockTask({ status: 'COMPLETED' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(completedTask);

      await expect(service.cancel('creator-id', 'task-id')).rejects.toThrow(
        'Cannot cancel a completed or already cancelled task',
      );
    });
  });

  describe('join', () => {
    beforeEach(() => {
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma));
    });

    it('should allow a worker to join an open task', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.taskWorker, 'create').mockResolvedValue({} as unknown as TaskWorker);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(openTask);

      await service.join('worker-id', 'task-id');

      expect(prisma.taskWorker.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { taskId: 'task-id', userId: 'worker-id' },
        }),
      );
    });

    it('should throw ForbiddenException when joining a non-open task', async () => {
      const draftTask = createMockTask({ status: 'DRAFT' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(draftTask);

      await expect(service.join('worker-id', 'task-id')).rejects.toThrow(
        'Task is not open for joining',
      );
    });

    it('should throw ForbiddenException when creator tries to join own task', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus, createdById: 'creator-id' });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);

      await expect(service.join('creator-id', 'task-id')).rejects.toThrow(
        'Cannot join your own task',
      );
    });

    it('should throw ConflictException on duplicate join', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest
        .spyOn(prisma.taskWorker, 'findUnique')
        .mockResolvedValue({ id: 'existing' } as unknown as TaskWorker);

      await expect(service.join('worker-id', 'task-id')).rejects.toThrow(
        'Already joined this task',
      );
    });

    it('should throw ForbiddenException when task is full', async () => {
      const fullTask = createMockTask({
        status: 'OPEN' as TaskStatus,
        workersJoined: 5,
        maxWorkers: 5,
      });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(fullTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(null);

      await expect(service.join('worker-id', 'task-id')).rejects.toThrow(
        'Task has reached maximum workers',
      );
    });
  });

  describe('leave', () => {
    beforeEach(() => {
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma));
    });

    it('should allow a worker to leave a task', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue({
        id: 'worker-record-id',
        taskId: 'task-id',
        userId: 'worker-id',
      } as unknown as TaskWorker);
      jest.spyOn(prisma.submission, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.taskWorker, 'delete').mockResolvedValue({} as unknown as TaskWorker);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(openTask);

      await service.leave('worker-id', 'task-id');

      expect(prisma.taskWorker.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'worker-record-id' } }),
      );
    });

    it('should throw NotFoundException when leaving a task the user is not part of', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(null);

      await expect(service.leave('worker-id', 'task-id')).rejects.toThrow(
        'Not a worker on this task',
      );
    });

    it('should throw ForbiddenException when leaving after submitting', async () => {
      const openTask = createMockTask({ status: 'OPEN' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(openTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue({
        id: 'worker-record-id',
        taskId: 'task-id',
        userId: 'worker-id',
      } as unknown as TaskWorker);
      jest
        .spyOn(prisma.submission, 'findFirst')
        .mockResolvedValue({ id: 'submission-id' } as unknown as Submission);

      await expect(service.leave('worker-id', 'task-id')).rejects.toThrow(
        'Cannot leave task after submitting work',
      );
    });
  });
});
