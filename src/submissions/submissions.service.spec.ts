import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import {
  Prisma,
  TaskStatus,
  SubmissionStatus,
  VerificationStatus,
  VerificationMode,
  EscrowStatus,
  TaskWorker,
  Submission as SubmissionModel,
  Verification,
  User,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { SubmissionsService } from './submissions.service';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};
import { databaseConfig, geminiConfig } from '../config';

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
    status: 'OPEN' as TaskStatus,
    aiGenerated: false,
    aiPrompt: null,
    tags: ['frontend', 'react'],
    workersRequired: 1,
    workersJoined: 2,
    workersCompleted: 0,
    maxWorkers: 5,
    verificationMode: 'AI' as VerificationMode,
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

function createMockVerification(
  overrides: Partial<{
    id: string;
    status: VerificationStatus;
    aiScore: number | null;
    aiFeedback: string | null;
    manualNotes: string | null;
    isManual: boolean;
    submissionId: string;
    verifiedById: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): Verification {
  return {
    id: 'verification-id',
    status: 'PASSED' as VerificationStatus,
    aiScore: 0.95,
    aiFeedback: 'Great work!',
    manualNotes: null,
    isManual: false,
    submissionId: 'submission-id',
    verifiedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as Verification;
}

function createMockSubmission(
  overrides: Partial<{
    id: string;
    content: string;
    proof: string | null;
    status: SubmissionStatus;
    aiScore: number | null;
    aiFeedback: string | null;
    taskId: string;
    workerId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: 'submission-id',
    content: 'Here is my completed work',
    proof: null,
    status: 'PENDING' as SubmissionStatus,
    aiScore: null,
    aiFeedback: null,
    taskId: 'task-id',
    workerId: 'worker-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prisma: PrismaService;
  let aiService: AiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, geminiConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [
        SubmissionsService,
        PrismaService,
        AiService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => cb(prisma));
    });

    it('should create a submission for a joined worker on an open task', async () => {
      const mockTask = createMockTask();
      const mockWorker: Partial<TaskWorker> = {
        id: 'worker-record',
        taskId: 'task-id',
        userId: 'worker-id',
      };

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(mockWorker as TaskWorker);
      jest.spyOn(prisma.submission, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.submission, 'create')
        .mockResolvedValue(createMockSubmission() as unknown as SubmissionModel);
      jest.spyOn(prisma.taskWorker, 'update').mockResolvedValue(mockWorker as TaskWorker);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(mockTask);

      const result = await service.create('task-id', 'worker-id', {
        content: 'Here is my completed work',
      });

      expect(result).toHaveProperty('id', 'submission-id');
      expect(prisma.submission.create).toHaveBeenCalled();
      expect(prisma.taskWorker.update).toHaveBeenCalled();
      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ workersCompleted: { increment: 1 } }),
        }),
      );
    });

    it('should throw ForbiddenException when task is not open or in progress', async () => {
      const cancelledTask = createMockTask({ status: 'CANCELLED' as TaskStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(cancelledTask);

      await expect(service.create('task-id', 'worker-id', { content: 'Work' })).rejects.toThrow(
        'Cannot submit to a task that is not open or in progress',
      );
    });

    it('should throw ForbiddenException when creator tries to submit', async () => {
      const task = createMockTask({ createdById: 'creator-id' });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(task);

      await expect(service.create('task-id', 'creator-id', { content: 'Work' })).rejects.toThrow(
        'Task creator cannot submit work',
      );
    });

    it('should throw ForbiddenException when worker has not joined', async () => {
      const task = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(task);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(null);

      await expect(service.create('task-id', 'worker-id', { content: 'Work' })).rejects.toThrow(
        'Must join the task before submitting',
      );
    });

    it('should throw ConflictException on duplicate submission', async () => {
      const task = createMockTask();
      const mockWorker: Partial<TaskWorker> = {
        id: 'worker-record',
        taskId: 'task-id',
        userId: 'worker-id',
      };

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(task);
      jest.spyOn(prisma.taskWorker, 'findUnique').mockResolvedValue(mockWorker as TaskWorker);
      jest
        .spyOn(prisma.submission, 'findFirst')
        .mockResolvedValue(createMockSubmission() as unknown as SubmissionModel);

      await expect(service.create('task-id', 'worker-id', { content: 'Work' })).rejects.toThrow(
        'Already submitted to this task',
      );
    });
  });

  describe('findByTask', () => {
    it('should return submissions for a task', async () => {
      const task = createMockTask();
      const mockSub = createMockSubmission();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(task);
      jest
        .spyOn(prisma.submission, 'findMany')
        .mockResolvedValue([{ ...mockSub, verification: null }] as unknown as SubmissionModel[]);

      const result = await service.findByTask('task-id', 'user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'submission-id');
    });
  });

  describe('findOne', () => {
    it('should return a submission by id', async () => {
      const mockSub = createMockSubmission();
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue({ ...mockSub, verification: null } as unknown as SubmissionModel);

      const result = await service.findOne('submission-id');

      expect(result).toHaveProperty('id', 'submission-id');
    });

    it('should throw NotFoundException for non-existent submission', async () => {
      jest.spyOn(prisma.submission, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow('Submission not found');
    });
  });

  describe('verifyAi', () => {
    it('should pass AI verification and approve submission', async () => {
      const task = createMockTask();
      const mockSub = { ...createMockSubmission(), task, verification: null };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);
      jest.spyOn(aiService, 'verifySubmission').mockResolvedValue({
        passed: true,
        score: 0.95,
        feedback: 'Great work!',
      });
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.verification, 'create').mockResolvedValue(
            createMockVerification({
              status: 'PASSED' as VerificationStatus,
              aiScore: 0.95,
              aiFeedback: 'Great work!',
            }),
          );
          jest.spyOn(tx.submission, 'update').mockResolvedValue({
            ...mockSub,
            status: 'APPROVED' as SubmissionStatus,
            verification: {
              id: 'verification-id',
              status: 'PASSED' as VerificationStatus,
              aiScore: 0.95,
              aiFeedback: 'Great work!',
              manualNotes: null,
              isManual: false,
              submissionId: 'submission-id',
              verifiedById: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          } as unknown as SubmissionModel);
          return cb(tx);
        });

      const result = await service.verifyAi('submission-id');

      expect(result.status).toBe('APPROVED');
      expect(result.verification).toHaveProperty('status', 'PASSED');
    });

    it('should fail AI verification and reject submission', async () => {
      const task = createMockTask();
      const mockSub = { ...createMockSubmission(), task, verification: null };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);
      jest.spyOn(aiService, 'verifySubmission').mockResolvedValue({
        passed: false,
        score: 0.3,
        feedback: 'Does not meet requirements',
      });
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.verification, 'create').mockResolvedValue(
            createMockVerification({
              status: 'FAILED' as VerificationStatus,
              aiScore: 0.3,
              aiFeedback: 'Does not meet requirements',
            }),
          );
          jest.spyOn(tx.submission, 'update').mockResolvedValue({
            ...mockSub,
            status: 'REJECTED' as SubmissionStatus,
            verification: {
              id: 'verification-id',
              status: 'FAILED' as VerificationStatus,
              aiScore: 0.3,
              aiFeedback: 'Does not meet requirements',
              manualNotes: null,
              isManual: false,
              submissionId: 'submission-id',
              verifiedById: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          } as unknown as SubmissionModel);
          return cb(tx);
        });

      const result = await service.verifyAi('submission-id');

      expect(result.status).toBe('REJECTED');
      expect(result.verification).toHaveProperty('status', 'FAILED');
    });

    it('should throw ConflictException on duplicate verification', async () => {
      const task = createMockTask();
      const mockSub = {
        ...createMockSubmission(),
        task,
        verification: { id: 'existing-verification', status: 'PASSED' as VerificationStatus },
      };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);

      await expect(service.verifyAi('submission-id')).rejects.toThrow(
        'Submission has already been verified',
      );
    });

    it('should throw ForbiddenException when task uses MANUAL mode', async () => {
      const task = createMockTask({ verificationMode: 'MANUAL' as VerificationMode });
      const mockSub = { ...createMockSubmission(), task, verification: null };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);

      await expect(service.verifyAi('submission-id')).rejects.toThrow(
        'This task requires manual verification only',
      );
    });
  });

  describe('verifyManual', () => {
    it('should approve submission when creator verifies', async () => {
      const task = createMockTask({
        verificationMode: 'MANUAL' as VerificationMode,
        createdById: 'creator-id',
      });
      const mockSub = {
        ...createMockSubmission({ workerId: 'worker-id' }),
        task,
        verification: null,
      };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.verification, 'create').mockResolvedValue(
            createMockVerification({
              status: 'PASSED' as VerificationStatus,
              manualNotes: 'Good job',
              isManual: true,
              verifiedById: 'creator-id',
            }),
          );
          jest.spyOn(tx.submission, 'update').mockResolvedValue({
            ...mockSub,
            status: 'APPROVED' as SubmissionStatus,
            verification: {
              id: 'verification-id',
              status: 'PASSED' as VerificationStatus,
              manualNotes: 'Good job',
              isManual: true,
              verifiedById: 'creator-id',
            },
          } as unknown as SubmissionModel);
          return cb(tx);
        });

      const result = await service.verifyManual('submission-id', 'creator-id', {
        status: 'APPROVED',
        manualNotes: 'Good job',
      });

      expect(result.status).toBe('APPROVED');
      expect(result.verification).toHaveProperty('isManual', true);
    });

    it('should throw ForbiddenException when unauthorized user tries to verify', async () => {
      const task = createMockTask({
        verificationMode: 'MANUAL' as VerificationMode,
        createdById: 'creator-id',
      });
      const mockSub = {
        ...createMockSubmission({ workerId: 'worker-id' }),
        task,
        verification: null,
      };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ id: 'random-user', role: 'USER' } as unknown as User);

      await expect(
        service.verifyManual('submission-id', 'random-user', { status: 'APPROVED' }),
      ).rejects.toThrow('Only the task creator or an admin can perform manual verification');
    });

    it('should throw ForbiddenException when task uses AI mode', async () => {
      const task = createMockTask({
        verificationMode: 'AI' as VerificationMode,
        createdById: 'creator-id',
      });
      const mockSub = {
        ...createMockSubmission({ workerId: 'worker-id' }),
        task,
        verification: null,
      };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);

      await expect(
        service.verifyManual('submission-id', 'creator-id', { status: 'APPROVED' }),
      ).rejects.toThrow('This task requires AI verification only');
    });

    it('should override AI verification when mode is BOTH', async () => {
      const task = createMockTask({
        verificationMode: 'BOTH' as VerificationMode,
        createdById: 'creator-id',
      });
      const mockSub = {
        ...createMockSubmission({ workerId: 'worker-id' }),
        task,
        verification: {
          id: 'ai-verification',
          status: 'PASSED' as VerificationStatus,
          isManual: false,
          aiScore: 0.95,
          aiFeedback: 'Good',
          manualNotes: null,
          verifiedById: null,
        },
      };
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSub as unknown as SubmissionModel);
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.verification, 'update').mockResolvedValue(
            createMockVerification({
              id: 'ai-verification',
              status: 'FAILED' as VerificationStatus,
              isManual: true,
              verifiedById: 'creator-id',
              manualNotes: 'Actually incorrect',
            }),
          );
          jest.spyOn(tx.submission, 'update').mockResolvedValue({
            ...mockSub,
            status: 'REJECTED' as SubmissionStatus,
            verification: {
              id: 'ai-verification',
              status: 'FAILED' as VerificationStatus,
              isManual: true,
              verifiedById: 'creator-id',
              manualNotes: 'Actually incorrect',
            },
          } as unknown as SubmissionModel);
          return cb(tx);
        });

      const result = await service.verifyManual('submission-id', 'creator-id', {
        status: 'REJECTED',
        manualNotes: 'Actually incorrect',
      });

      expect(result.status).toBe('REJECTED');
      expect(result.verification).toHaveProperty('isManual', true);
    });
  });
});
