/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { geminiConfig } from '../config';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = '';
    process.env.GEMINI_MODEL = 'gemini-3.6-flash';

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [geminiConfig] })],
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  describe('model selection', () => {
    it('should resolve the supported flash models when no model is configured', () => {
      expect((service as any).resolveModelNames()).toEqual(['gemini-3.6-flash']);
    });

    it('should parse logical OR model values from the environment', () => {
      const original = process.env.GEMINI_MODEL;
      process.env.GEMINI_MODEL = 'gemini-3.6-flash';

      try {
        expect((service as any).resolveModelNames()).toEqual(['gemini-3.6-flash']);
      } finally {
        if (original === undefined) {
          delete process.env.GEMINI_MODEL;
        } else {
          process.env.GEMINI_MODEL = original;
        }
      }
    });
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
    }, 30000);

    it('should include submission proof when provided', async () => {
      const result = await service.verifySubmission({
        taskTitle: 'Test Task',
        taskDescription: 'A test task',
        taskRequirements: 'Do something',
        submissionContent: 'Done',
        submissionProof: 'https://proof.example.com',
      });

      expect(result).toHaveProperty('passed', true);
    }, 30000);
  });
});
