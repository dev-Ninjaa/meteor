import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../database/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { databaseConfig, monadConfig } from '../config';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, monadConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        PrismaService,
        BlockchainService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('createEscrow', () => {
    it('should delegate to service', async () => {
      const mockResponse = {
        id: 'tx-id',
        amount: '0.2',
        tokenAddress: null,
        txHash: '0xabc',
        chainId: 10143,
        blockNumber: '1000',
        gasUsed: '21000',
        status: 'LOCKED',
        type: 'ESCROW_CREATE',
        taskId: 'task-id',
        userId: 'creator-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(paymentsService, 'createEscrow').mockResolvedValue(mockResponse);

      const result = await controller.createEscrow('creator-id', { taskId: 'task-id' });

      expect(result).toHaveProperty('txHash', '0xabc');
    });
  });

  describe('releaseEscrow', () => {
    it('should delegate to service', async () => {
      const mockResponse = {
        id: 'tx-id',
        amount: '0.1',
        tokenAddress: null,
        txHash: '0xrelease',
        chainId: 10143,
        blockNumber: '1001',
        gasUsed: '21000',
        status: 'RELEASED',
        type: 'ESCROW_RELEASE',
        taskId: 'task-id',
        userId: 'worker-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(paymentsService, 'releaseEscrow').mockResolvedValue(mockResponse);

      const result = await controller.releaseEscrow('creator-id', {
        taskId: 'task-id',
        submissionId: 'submission-id',
      });

      expect(result).toHaveProperty('status', 'RELEASED');
    });
  });

  describe('refundEscrow', () => {
    it('should delegate to service', async () => {
      const mockResponse = {
        id: 'tx-id',
        amount: '0.2',
        tokenAddress: null,
        txHash: '0xrefund',
        chainId: 10143,
        blockNumber: '1002',
        gasUsed: '21000',
        status: 'REFUNDED',
        type: 'ESCROW_REFUND',
        taskId: 'task-id',
        userId: 'creator-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(paymentsService, 'refundEscrow').mockResolvedValue(mockResponse);

      const result = await controller.refundEscrow('creator-id', { taskId: 'task-id' });

      expect(result).toHaveProperty('status', 'REFUNDED');
    });
  });

  describe('findTransactions', () => {
    it('should delegate to service', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      jest.spyOn(paymentsService, 'findTransactions').mockResolvedValue(mockResponse);

      const result = await controller.findTransactions({});

      expect(result).toHaveProperty('total', 0);
    });
  });

  describe('findTransaction', () => {
    it('should delegate to service', async () => {
      const mockResponse = {
        id: 'tx-id',
        amount: '0.2',
        tokenAddress: null,
        txHash: '0xabc',
        chainId: 10143,
        blockNumber: '1000',
        gasUsed: '21000',
        status: 'LOCKED',
        type: 'ESCROW_CREATE',
        taskId: 'task-id',
        userId: 'creator-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(paymentsService, 'findTransaction').mockResolvedValue(mockResponse);

      const result = await controller.findTransaction('tx-id');

      expect(result).toHaveProperty('id', 'tx-id');
    });
  });
});
