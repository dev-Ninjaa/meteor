import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { redisConfig, jwtConfig } from '../config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [redisConfig, jwtConfig],
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        PrismaService,
        RedisService,
        {
          provide: JwtService,
          useFactory: () => new JwtService({ secret: 'test-secret' }),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestNonce', () => {
    it('should return nonce for wallet address', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      jest.spyOn(authService, 'requestNonce').mockResolvedValue({
        nonce: 'test-nonce',
        walletAddress,
      });

      const result = await controller.requestNonce({ walletAddress });

      expect(result).toEqual({ nonce: 'test-nonce', walletAddress });
    });
  });

  describe('verify', () => {
    it('should return auth response on valid signature', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      jest.spyOn(authService, 'verifySignature').mockResolvedValue({
        user: { id: 'user-id', username: null, walletAddress, reputation: 0 },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.verify({
        walletAddress,
        signature: '0xsignature',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });
  });

  describe('refresh', () => {
    it('should return new tokens', async () => {
      jest.spyOn(authService, 'refreshTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refresh({ refreshToken: 'old-token' });

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue();

      const mockRequest = {
        headers: { authorization: 'Bearer test-token' },
      } as unknown as Request;

      const result = await controller.logout(mockRequest);

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
