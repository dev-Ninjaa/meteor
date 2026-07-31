import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { databaseConfig, geminiConfig } from '../config';

const mockNotificationsService = {
  createNotification: jest.fn(),
  createManyNotifications: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let submissionsService: SubmissionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, geminiConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [SubmissionsController],
      providers: [
        SubmissionsService,
        PrismaService,
        AiService,
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    submissionsService = module.get<SubmissionsService>(SubmissionsService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should delegate to service and return submission', async () => {
      const mockResponse = {
        id: 'submission-id',
        content: 'Here is my work',
        proof: null,
        status: 'PENDING',
        aiScore: null,
        aiFeedback: null,
        taskId: 'task-id',
        workerId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        verification: null,
      };

      jest.spyOn(submissionsService, 'create').mockResolvedValue(mockResponse);

      const result = await controller.create('user-id', 'task-id', {
        content: 'Here is my work',
      });

      expect(result).toHaveProperty('id', 'submission-id');
    });
  });

  describe('findByTask', () => {
    it('should return submissions for a task', async () => {
      jest.spyOn(submissionsService, 'findByTask').mockResolvedValue([]);

      const result = await controller.findByTask('user-id', 'task-id');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a submission by id', async () => {
      const mockResponse = {
        id: 'submission-id',
        content: 'Here is my work',
        proof: null,
        status: 'PENDING',
        aiScore: null,
        aiFeedback: null,
        taskId: 'task-id',
        workerId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        verification: null,
      };

      jest.spyOn(submissionsService, 'findOne').mockResolvedValue(mockResponse);

      const result = await controller.findOne('submission-id');

      expect(result).toHaveProperty('id', 'submission-id');
    });
  });

  describe('verifyAi', () => {
    it('should delegate AI verification', async () => {
      const mockResponse = {
        id: 'submission-id',
        content: 'Here is my work',
        proof: null,
        status: 'APPROVED',
        aiScore: 0.95,
        aiFeedback: 'Great',
        taskId: 'task-id',
        workerId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        verification: {
          id: 'verification-id',
          status: 'PASSED',
          aiScore: 0.95,
          aiFeedback: 'Great',
          manualNotes: null,
          isManual: false,
          verifiedById: null,
        },
      };

      jest.spyOn(submissionsService, 'verifyAi').mockResolvedValue(mockResponse);

      const result = await controller.verifyAi('submission-id');

      expect(result).toHaveProperty('status', 'APPROVED');
    });
  });

  describe('verifyManual', () => {
    it('should delegate manual verification', async () => {
      const mockResponse = {
        id: 'submission-id',
        content: 'Here is my work',
        proof: null,
        status: 'APPROVED',
        aiScore: null,
        aiFeedback: null,
        taskId: 'task-id',
        workerId: 'user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        verification: {
          id: 'verification-id',
          status: 'PASSED',
          aiScore: null,
          aiFeedback: null,
          manualNotes: 'Good job',
          isManual: true,
          verifiedById: 'creator-id',
        },
      };

      jest.spyOn(submissionsService, 'verifyManual').mockResolvedValue(mockResponse);

      const result = await controller.verifyManual('creator-id', 'submission-id', {
        status: 'APPROVED',
        manualNotes: 'Good job',
      });

      expect(result).toHaveProperty('status', 'APPROVED');
    });
  });
});
