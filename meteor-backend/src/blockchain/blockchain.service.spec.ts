import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { monadConfig } from '../config';
import { PrismaService } from '../database/prisma.service';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [monadConfig],
        }),
      ],
      providers: [BlockchainService, PrismaService],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have createEscrow method', () => {
    expect(service.createEscrow).toBeDefined();
    expect(typeof service.createEscrow).toBe('function');
  });

  it('should have releaseFunds method', () => {
    expect(service.releaseFunds).toBeDefined();
    expect(typeof service.releaseFunds).toBe('function');
  });

  it('should have refundEscrow method', () => {
    expect(service.refundEscrow).toBeDefined();
    expect(typeof service.refundEscrow).toBe('function');
  });

  it('should have verifyTransaction method', () => {
    expect(service.verifyTransaction).toBeDefined();
    expect(typeof service.verifyTransaction).toBe('function');
  });

  it('should have getTransactionStatus method', () => {
    expect(service.getTransactionStatus).toBeDefined();
    expect(typeof service.getTransactionStatus).toBe('function');
  });
});
