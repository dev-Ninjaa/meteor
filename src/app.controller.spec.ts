import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';
import { RedisService } from './redis/redis.service';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  swaggerConfig,
  geminiConfig,
  monadConfig,
} from './config';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.REDIS_HOST = 'localhost';
    process.env.REDIS_PORT = '6379';
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          isGlobal: true,
          load: [
            appConfig,
            databaseConfig,
            redisConfig,
            jwtConfig,
            swaggerConfig,
            geminiConfig,
            monadConfig,
          ],
        }),
        LoggerModule.forRoot({
          pinoHttp: {
            level: 'silent',
          },
        }),
      ],
      controllers: [AppController],
      providers: [PrismaService, RedisService],
    }).compile();

    appController = module.get<AppController>(AppController);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkHealth', () => {
    it('should return healthy status when all services are connected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ 1: 1 }]);
      jest.spyOn(redisService.getClient(), 'ping').mockResolvedValue('PONG');

      const result = await appController.checkHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('redis', 'connected');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return degraded status when database is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));
      jest.spyOn(redisService.getClient(), 'ping').mockResolvedValue('PONG');

      const result = await appController.checkHealth();

      expect(result).toHaveProperty('status', 'degraded');
      expect(result).toHaveProperty('database', 'disconnected');
      expect(result).toHaveProperty('redis', 'connected');
    });

    it('should return degraded status when redis is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ 1: 1 }]);
      jest
        .spyOn(redisService.getClient(), 'ping')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await appController.checkHealth();

      expect(result).toHaveProperty('status', 'degraded');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('redis', 'disconnected');
    });

    it('should return degraded status when both services are disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));
      jest
        .spyOn(redisService.getClient(), 'ping')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await appController.checkHealth();

      expect(result).toHaveProperty('status', 'degraded');
      expect(result).toHaveProperty('database', 'disconnected');
      expect(result).toHaveProperty('redis', 'disconnected');
    });
  });

  describe('checkLiveness', () => {
    it('should return alive status', () => {
      const result = appController.checkLiveness();
      expect(result).toHaveProperty('status', 'alive');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('checkReadiness', () => {
    it('should return ready status when all services are connected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ 1: 1 }]);
      jest.spyOn(redisService.getClient(), 'ping').mockResolvedValue('PONG');

      const result = await appController.checkReadiness();

      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('redis', 'connected');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return not ready when database is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));
      jest.spyOn(redisService.getClient(), 'ping').mockResolvedValue('PONG');

      const result = await appController.checkReadiness();

      expect(result).toHaveProperty('status', 'not ready');
      expect(result).toHaveProperty('database', 'disconnected');
      expect(result).toHaveProperty('redis', 'connected');
    });

    it('should return not ready when redis is disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ 1: 1 }]);
      jest
        .spyOn(redisService.getClient(), 'ping')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await appController.checkReadiness();

      expect(result).toHaveProperty('status', 'not ready');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('redis', 'disconnected');
    });

    it('should return not ready when both services are disconnected', async () => {
      jest.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection failed'));
      jest
        .spyOn(redisService.getClient(), 'ping')
        .mockRejectedValue(new Error('Connection failed'));

      const result = await appController.checkReadiness();

      expect(result).toHaveProperty('status', 'not ready');
      expect(result).toHaveProperty('database', 'disconnected');
      expect(result).toHaveProperty('redis', 'disconnected');
    });
  });
});
