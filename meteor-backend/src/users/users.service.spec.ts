import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { databaseConfig } from '../config';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const mockUser = {
    id: 'user-id',
    username: 'alice',
    email: null,
    password: null,
    role: 'USER' as const,
    avatarUrl: null,
    bio: 'Developer',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    nonce: null,
    reputation: 10,
    isVerified: false,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  describe('getMe', () => {
    it('should return user profile', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.getMe('user-id');

      expect(result).toHaveProperty('id', 'user-id');
      expect(result).toHaveProperty('username', 'alice');
      expect(result).toHaveProperty('walletAddress', mockUser.walletAddress);
    });

    it('should throw NotFoundException for deleted user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.getMe('user-id')).rejects.toThrow('User not found');
    });

    it('should throw NotFoundException for non-existent user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('updateMe', () => {
    it('should update username', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUser,
        username: 'bob',
      });

      const result = await service.updateMe('user-id', { username: 'bob' });

      expect(result).toHaveProperty('username', 'bob');
    });

    it('should throw ConflictException when username is taken', async () => {
      const otherUser = { ...mockUser, id: 'other-id', username: 'bob' };
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(otherUser);

      await expect(service.updateMe('user-id', { username: 'bob' })).rejects.toThrow(
        'Username already taken',
      );
    });
  });

  describe('findByWalletAddress', () => {
    it('should return user by wallet address', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);

      const result = await service.findByWalletAddress(mockUser.walletAddress);

      expect(result).toHaveProperty('id', 'user-id');
      expect(result).toHaveProperty('walletAddress', mockUser.walletAddress);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(
        service.findByWalletAddress('0x0000000000000000000000000000000000000000'),
      ).rejects.toThrow('User not found');
    });
  });
});
