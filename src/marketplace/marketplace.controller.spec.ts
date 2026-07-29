import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../database/prisma.service';
import { databaseConfig } from '../config';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;
  let marketplaceService: MarketplaceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
      ],
      controllers: [MarketplaceController],
      providers: [MarketplaceService, PrismaService],
    }).compile();

    controller = module.get<MarketplaceController>(MarketplaceController);
    marketplaceService = module.get<MarketplaceService>(MarketplaceService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated marketplace listing', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      jest.spyOn(marketplaceService, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toHaveProperty('total', 0);
      expect(result).toHaveProperty('page', 1);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      jest.spyOn(marketplaceService, 'findAll').mockResolvedValue(mockResponse);

      const result = await controller.search({ search: 'landing' });

      expect(result).toHaveProperty('total', 0);
    });
  });

  describe('getTags', () => {
    it('should return unique tags', async () => {
      jest.spyOn(marketplaceService, 'getTags').mockResolvedValue(['frontend', 'react']);

      const result = await controller.getTags();

      expect(result).toEqual(['frontend', 'react']);
    });
  });
});
