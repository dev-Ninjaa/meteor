import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';
import { databaseConfig } from '../config';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [UsersController],
      providers: [UsersService, PrismaService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const mockResponse = {
        id: 'user-id',
        username: 'alice',
        avatarUrl: null,
        bio: 'Developer',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        reputation: 10,
        role: 'USER',
        createdAt: new Date(),
      };

      jest.spyOn(usersService, 'getMe').mockResolvedValue(mockResponse);

      const result = await controller.getMe('user-id');

      expect(result).toHaveProperty('id', 'user-id');
      expect(result).toHaveProperty('username', 'alice');
    });
  });

  describe('updateMe', () => {
    it('should update and return user profile', async () => {
      const mockResponse = {
        id: 'user-id',
        username: 'bob',
        avatarUrl: null,
        bio: 'Updated bio',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        reputation: 10,
        role: 'USER',
        createdAt: new Date(),
      };

      jest.spyOn(usersService, 'updateMe').mockResolvedValue(mockResponse);

      const result = await controller.updateMe('user-id', {
        username: 'bob',
        bio: 'Updated bio',
      });

      expect(result).toHaveProperty('username', 'bob');
      expect(result).toHaveProperty('bio', 'Updated bio');
    });
  });

  describe('findByWalletAddress', () => {
    it('should return user by wallet address', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const mockResponse = {
        id: 'user-id',
        username: 'alice',
        avatarUrl: null,
        bio: null,
        walletAddress,
        reputation: 0,
        role: 'USER',
        createdAt: new Date(),
      };

      jest.spyOn(usersService, 'findByWalletAddress').mockResolvedValue(mockResponse);

      const result = await controller.findByWalletAddress(walletAddress);

      expect(result).toHaveProperty('walletAddress', walletAddress);
    });
  });
});
