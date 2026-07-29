import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { geminiConfig } from '../config';

describe('AiService', () => {
  let service: AiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [geminiConfig] })],
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  describe('verifySubmission', () => {
    it('should return mock result when API key is not configured', async () => {
      const result = await service.verifySubmission({
        taskTitle: 'Test Task',
        taskDescription: 'A test task',
        taskRequirements: 'Do something',
        submissionContent: 'Done',
      });

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('feedback');
    });

    it('should include submission proof when provided', async () => {
      const result = await service.verifySubmission({
        taskTitle: 'Test Task',
        taskDescription: 'A test task',
        taskRequirements: 'Do something',
        submissionContent: 'Done',
        submissionProof: 'https://proof.example.com',
      });

      expect(result).toHaveProperty('passed', true);
    });
  });
});
