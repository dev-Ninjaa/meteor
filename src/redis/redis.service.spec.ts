import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { redisConfig } from '../config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [redisConfig],
        }),
      ],
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a getClient method', () => {
    expect(service.getClient).toBeDefined();
    expect(typeof service.getClient).toBe('function');
  });

  it('should have set, get, del methods', () => {
    expect(service.set).toBeDefined();
    expect(service.get).toBeDefined();
    expect(service.del).toBeDefined();
    expect(service.publish).toBeDefined();
  });
});
