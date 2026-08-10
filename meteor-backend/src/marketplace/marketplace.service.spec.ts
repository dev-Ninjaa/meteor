import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { Prisma, TaskStatus, VerificationMode, EscrowStatus, Task } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MarketplaceService } from './marketplace.service';
import { databaseConfig } from '../config';

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

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [MarketplaceService, PrismaService],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated open tasks', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([mockTask]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should only return OPEN tasks with no deletedAt', async () => {
      const mockTask = createMockTask();
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([mockTask]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(1);

      await service.findAll({});

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN' as TaskStatus,
            deletedAt: null,
          }),
        }),
      );
    });

    it('should filter by tag', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ tag: 'frontend' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { has: 'frontend' },
          }),
        }),
      );
    });

    it('should filter by verification mode', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ verificationMode: 'MANUAL' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verificationMode: 'MANUAL',
          }),
        }),
      );
    });

    it('should filter by reward range', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ minReward: '0.01', maxReward: '10.0' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            reward: expect.objectContaining({
              gte: expect.any(Prisma.Decimal),
              lte: expect.any(Prisma.Decimal),
            }),
          }),
        }),
      );
    });

    it('should filter by creator', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ createdBy: 'creator-id' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdById: 'creator-id',
          }),
        }),
      );
    });

    it('should sort by newest by default', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should sort by highest reward', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ sortBy: 'highest_reward' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { reward: 'desc' } }),
      );
    });

    it('should sort by most workers joined', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ sortBy: 'most_workers' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { workersJoined: 'desc' } }),
      );
    });

    it('should search by title and description', async () => {
      jest.spyOn(prisma.task, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.task, 'count').mockResolvedValue(0);

      await service.findAll({ search: 'landing' });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'landing', mode: 'insensitive' } },
              { description: { contains: 'landing', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('getTags', () => {
    it('should return sorted unique tags from open tasks', async () => {
      const tasks = [
        { tags: ['frontend', 'react'] },
        { tags: ['frontend', 'vue'] },
        { tags: ['backend', 'react'] },
      ];

      jest.spyOn(prisma.task, 'findMany').mockResolvedValue(tasks as unknown as Task[]);

      const result = await service.getTags();

      expect(result).toEqual(['backend', 'frontend', 'react', 'vue']);
    });
  });
});
