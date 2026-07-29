import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { Prisma, EscrowStatus, Task, Transaction, Submission, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { PaymentsService } from './payments.service';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};
import { databaseConfig, monadConfig } from '../config';

function createMockTask(
  overrides: Partial<{
    id: string;
    title: string;
    description: string;
    reward: Prisma.Decimal;
    tokenAddress: string | null;
    status: string;
    aiGenerated: boolean;
    aiPrompt: string | null;
    tags: string[];
    workersRequired: number;
    workersJoined: number;
    workersCompleted: number;
    maxWorkers: number;
    verificationMode: string;
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
    status: 'OPEN',
    aiGenerated: false,
    aiPrompt: null,
    tags: ['frontend'],
    workersRequired: 2,
    workersJoined: 2,
    workersCompleted: 0,
    maxWorkers: 5,
    verificationMode: 'AI',
    allowAiVerification: true,
    manualVerificationRequired: false,
    escrowStatus: 'UNLOCKED' as EscrowStatus,
    createdById: 'creator-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as unknown as Task;
}

function createMockTransaction(
  overrides: Partial<{
    id: string;
    amount: Prisma.Decimal;
    tokenAddress: string | null;
    txHash: string | null;
    chainId: number | null;
    blockNumber: bigint | null;
    gasUsed: string | null;
    status: string;
    type: string;
    taskId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) {
  return {
    id: 'tx-id',
    amount: new Prisma.Decimal('0.2'),
    tokenAddress: null,
    txHash: '0xabc123',
    chainId: 10143,
    blockNumber: BigInt(1000),
    gasUsed: '21000',
    status: 'LOCKED',
    type: 'ESCROW_CREATE',
    taskId: 'task-id',
    userId: 'creator-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as unknown as Transaction;
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let blockchainService: BlockchainService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, monadConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [
        PaymentsService,
        PrismaService,
        BlockchainService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('createEscrow', () => {
    it('should create escrow successfully', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue({ id: 'creator-id', walletAddress: '0xCreator' } as unknown as User);
      jest.spyOn(blockchainService, 'createEscrow').mockResolvedValue({ txHash: '0xescrow' });
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest
            .spyOn(tx.transaction, 'create')
            .mockResolvedValue(createMockTransaction({ txHash: '0xescrow' }));
          jest.spyOn(tx.task, 'update').mockResolvedValue(mockTask);
          return cb(tx);
        });

      const result = await service.createEscrow('creator-id', { taskId: 'task-id' });

      expect(result).toHaveProperty('txHash', '0xescrow');
      expect(result).toHaveProperty('status', 'LOCKED');
      expect(blockchainService.createEscrow).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent task', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(service.createEscrow('creator-id', { taskId: 'task-id' })).rejects.toThrow(
        'Task not found',
      );
    });

    it('should throw ForbiddenException when not the creator', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.createEscrow('other-user', { taskId: 'task-id' })).rejects.toThrow(
        'Only the task creator can create escrow',
      );
    });

    it('should throw ForbiddenException when task is not OPEN', async () => {
      const mockTask = createMockTask({ status: 'DRAFT' });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.createEscrow('creator-id', { taskId: 'task-id' })).rejects.toThrow(
        'Can only create escrow for open tasks',
      );
    });

    it('should throw ConflictException when escrow already exists', async () => {
      const mockTask = createMockTask({ escrowStatus: 'LOCKED' as EscrowStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.createEscrow('creator-id', { taskId: 'task-id' })).rejects.toThrow(
        'Escrow already exists for this task',
      );
    });
  });

  describe('releaseEscrow', () => {
    it('should release escrow successfully', async () => {
      const mockTask = createMockTask({ escrowStatus: 'LOCKED' as EscrowStatus });
      const mockSubmission = {
        id: 'submission-id',
        status: 'APPROVED',
        workerId: 'worker-id',
        taskId: 'task-id',
        verification: { id: 'verif-id', status: 'PASSED' },
      };

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSubmission as unknown as Submission);
      jest.spyOn(blockchainService, 'releaseFunds').mockResolvedValue({ txHash: '0xrelease' });
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.transaction, 'create').mockResolvedValue(
            createMockTransaction({
              txHash: '0xrelease',
              status: 'RELEASED',
              type: 'ESCROW_RELEASE',
            }),
          );
          jest.spyOn(tx.task, 'update').mockResolvedValue(mockTask);
          return cb(tx);
        });

      const result = await service.releaseEscrow('creator-id', {
        taskId: 'task-id',
        submissionId: 'submission-id',
      });

      expect(result).toHaveProperty('txHash', '0xrelease');
      expect(blockchainService.releaseFunds).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when submission is not approved', async () => {
      const mockTask = createMockTask({ escrowStatus: 'LOCKED' as EscrowStatus });
      const mockSubmission = {
        id: 'submission-id',
        status: 'PENDING',
        workerId: 'worker-id',
        verification: null,
      };

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSubmission as unknown as Submission);

      await expect(
        service.releaseEscrow('creator-id', { taskId: 'task-id', submissionId: 'submission-id' }),
      ).rejects.toThrow('Cannot release payment for a submission that is not approved');
    });

    it('should throw ForbiddenException when verification is not passed', async () => {
      const mockTask = createMockTask({ escrowStatus: 'LOCKED' as EscrowStatus });
      const mockSubmission = {
        id: 'submission-id',
        status: 'APPROVED',
        workerId: 'worker-id',
        verification: { id: 'verif-id', status: 'FAILED' },
      };

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest
        .spyOn(prisma.submission, 'findUnique')
        .mockResolvedValue(mockSubmission as unknown as Submission);

      await expect(
        service.releaseEscrow('creator-id', { taskId: 'task-id', submissionId: 'submission-id' }),
      ).rejects.toThrow('Cannot release payment without a passed verification');
    });

    it('should throw ConflictException when escrow is not LOCKED', async () => {
      const mockTask = createMockTask({ escrowStatus: 'RELEASED' as EscrowStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(
        service.releaseEscrow('creator-id', { taskId: 'task-id', submissionId: 'submission-id' }),
      ).rejects.toThrow('Escrow is not in a locked state');
    });
  });

  describe('refundEscrow', () => {
    it('should refund escrow when task is cancelled', async () => {
      const mockTask = createMockTask({
        escrowStatus: 'LOCKED' as EscrowStatus,
        status: 'CANCELLED',
      });

      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);
      jest.spyOn(blockchainService, 'refundEscrow').mockResolvedValue({ txHash: '0xrefund' });
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) => {
          const tx = prisma;
          jest.spyOn(tx.transaction, 'create').mockResolvedValue(
            createMockTransaction({
              txHash: '0xrefund',
              status: 'REFUNDED',
              type: 'ESCROW_REFUND',
            }),
          );
          jest.spyOn(tx.task, 'update').mockResolvedValue(mockTask);
          return cb(tx);
        });

      const result = await service.refundEscrow('creator-id', { taskId: 'task-id' });

      expect(result).toHaveProperty('status', 'REFUNDED');
      expect(blockchainService.refundEscrow).toHaveBeenCalled();
    });

    it('should throw ConflictException when escrow is not LOCKED', async () => {
      const mockTask = createMockTask({
        escrowStatus: 'REFUNDED' as EscrowStatus,
        status: 'CANCELLED',
      });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.refundEscrow('creator-id', { taskId: 'task-id' })).rejects.toThrow(
        'Escrow is not in a locked state',
      );
    });

    it('should throw ForbiddenException when not creator', async () => {
      const mockTask = createMockTask({ escrowStatus: 'LOCKED' as EscrowStatus });
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(mockTask);

      await expect(service.refundEscrow('other-user', { taskId: 'task-id' })).rejects.toThrow(
        'Only the task creator can refund escrow',
      );
    });
  });

  describe('findTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTx = createMockTransaction();
      jest.spyOn(prisma.transaction, 'findMany').mockResolvedValue([mockTx]);
      jest.spyOn(prisma.transaction, 'count').mockResolvedValue(1);

      const result = await service.findTransactions({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by status', async () => {
      jest.spyOn(prisma.transaction, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.transaction, 'count').mockResolvedValue(0);

      await service.findTransactions({ status: 'LOCKED' });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'LOCKED' }),
        }),
      );
    });

    it('should filter by type', async () => {
      jest.spyOn(prisma.transaction, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.transaction, 'count').mockResolvedValue(0);

      await service.findTransactions({ type: 'ESCROW_CREATE' });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ESCROW_CREATE' }),
        }),
      );
    });

    it('should filter by taskId', async () => {
      jest.spyOn(prisma.transaction, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.transaction, 'count').mockResolvedValue(0);

      await service.findTransactions({ taskId: 'task-id' });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ taskId: 'task-id' }),
        }),
      );
    });
  });

  describe('findTransaction', () => {
    it('should return a transaction by id', async () => {
      const mockTx = createMockTransaction();
      jest.spyOn(prisma.transaction, 'findUnique').mockResolvedValue(mockTx);

      const result = await service.findTransaction('tx-id');

      expect(result).toHaveProperty('id', 'tx-id');
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      jest.spyOn(prisma.transaction, 'findUnique').mockResolvedValue(null);

      await expect(service.findTransaction('non-existent')).rejects.toThrow(
        'Transaction not found',
      );
    });
  });
});
