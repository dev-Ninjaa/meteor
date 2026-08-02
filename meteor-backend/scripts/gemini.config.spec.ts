/// <reference types="jest" />

import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../src/ai/ai.service';
import { geminiConfig } from '../src/config/index';
import * as taskGeneratorPrompt from '../src/ai/prompts/task-generator.prompt';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(),
}));

describe('Gemini AI integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads Gemini credentials from .env.example when env vars are absent', () => {
    const config = geminiConfig();

    expect(config.apiKey).toBeTruthy();
    expect(config.model).toBe('gemini-3.6-flash');
  });

  it('uses the shared task generator prompt builder for AI task generation', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => JSON.stringify({
        title: 'Generated Task',
        description: 'A generated task',
        reward: '25.0',
        tags: ['ai', 'testing'],
        workersRequired: 2,
        maxWorkers: 3,
        verificationMode: 'AI',
        category: 'testing',
      }) },
    });

    (GoogleGenerativeAI as unknown as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
    }));

    const promptSpy = jest.spyOn(taskGeneratorPrompt, 'buildTaskGeneratorPrompt').mockReturnValue('custom task prompt');

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [geminiConfig] })],
      providers: [AiService],
    }).compile();

    const service = module.get<AiService>(AiService);
    const result = await service.generateTask({ prompt: 'Create a testing task', category: 'testing' });

    expect(promptSpy).toHaveBeenCalledWith({
      userPrompt: 'Create a testing task',
      maxWorkers: 5,
      rewardRange: '10-500 MON',
    });
    const generatedPrompt = mockGenerateContent.mock.calls[0]?.[0] as string;
    expect(generatedPrompt).toContain('custom task prompt');
    expect(generatedPrompt).toContain('Category hint: testing');
    expect(result.title).toBe('Generated Task');
  });
});
