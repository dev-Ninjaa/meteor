import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from 'nestjs-pino';
import { recoverMessageAddress } from 'viem';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { redisConfig, jwtConfig } from '../config';

jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  recoverMessageAddress: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [redisConfig, jwtConfig],
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
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

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await redis.onModuleDestroy();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestNonce', () => {
    const mockUserRecord = {
      id: 'test-id',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      nonce: 'test-nonce',
      username: null,
      email: null,
      password: null,
      role: 'USER' as const,
      avatarUrl: null,
      bio: null,
      reputation: 0,
      isVerified: false,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should generate a nonce for a new wallet address', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUserRecord);

      const result = await service.requestNonce(mockUserRecord.walletAddress);

      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('walletAddress', mockUserRecord.walletAddress);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { walletAddress: mockUserRecord.walletAddress, nonce: expect.any(String) },
      });
    });

    it('should update nonce for an existing wallet address', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUserRecord);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUserRecord,
        nonce: 'new-nonce',
      });

      const result = await service.requestNonce(mockUserRecord.walletAddress);

      expect(result).toHaveProperty('nonce');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('verifySignature', () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';

    const mockUserRecord = {
      id: 'test-id',
      walletAddress,
      nonce: 'test-nonce',
      username: null,
      email: null,
      password: null,
      role: 'USER' as const,
      avatarUrl: null,
      bio: null,
      reputation: 0,
      isVerified: false,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should throw when no nonce was requested', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(service.verifySignature(walletAddress, '0xsignature')).rejects.toThrow(
        'No nonce requested for this wallet',
      );
    });

    it('should throw when signature does not match wallet address', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUserRecord);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUserRecord,
        nonce: null,
      });
      (recoverMessageAddress as jest.Mock).mockResolvedValue(
        '0x0000000000000000000000000000000000000000',
      );

      await expect(service.verifySignature(walletAddress, '0xvalid-signature')).rejects.toThrow(
        'Signature does not match wallet address',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should throw on invalid refresh token', async () => {
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });
  });

  describe('logout', () => {
    it('should complete without error', async () => {
      jest.spyOn(redis, 'set').mockResolvedValue();
      await expect(service.logout('test-token')).resolves.not.toThrow();
    });
  });
});
