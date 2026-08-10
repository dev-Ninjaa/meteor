import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildTaskGeneratorPrompt } from './prompts/task-generator.prompt';
import { buildVerificationPrompt } from './prompts/verification.prompt';

const SUPPORTED_GEMINI_MODELS = ['gemini-3.6-flash'] as const;

export interface AiVerificationResult {
  passed: boolean;
  score: number;
  feedback: string;
}

export interface AiTaskSuggestion {
  title: string;
  description: string;
  reward: string;
  tags: string[];
  workersRequired: number;
  maxWorkers: number;
  verificationMode: 'AI' | 'MANUAL' | 'BOTH';
  category: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAi: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey =
      this.configService.get<string>('gemini.apiKey') || process.env.GEMINI_API_KEY || '';

    if (apiKey) {
      this.genAi = new GoogleGenerativeAI(apiKey);
    }
  }

  private resolveModelNames(): string[] {
    const configuredValue =
      this.configService.get<string>('gemini.model') ||
      process.env.GEMINI_MODEL ||
      'gemini-3.6-flash';

    const candidates = configuredValue
      .split(/\s*\|\|\s*|\s*,\s*/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    const validModels = candidates.filter(
      (model): model is (typeof SUPPORTED_GEMINI_MODELS)[number] =>
        SUPPORTED_GEMINI_MODELS.includes(model as (typeof SUPPORTED_GEMINI_MODELS)[number]),
    );

    return validModels.length > 0 ? validModels : ['gemini-3.6-flash'];
  }

  private async generateWithModel(prompt: string): Promise<string> {
    if (!this.genAi) {
      throw new Error('Gemini client is not configured');
    }

    const modelNames = this.resolveModelNames();
    const failures: string[] = [];

    for (const modelName of modelNames) {
      try {
        const model = this.genAi.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Gemini request timed out for ${modelName}`)), 10000);
          }),
        ]);
        return result.response.text();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${modelName}: ${message}`);
        this.logger.warn(`Gemini model ${modelName} failed`, error);
      }
    }

    throw new Error(
      `Unable to generate content with the configured Gemini models. ${failures.join(' | ')}`,
    );
  }

  async verifySubmission(params: {
    taskTitle: string;
    taskDescription: string;
    taskRequirements: string;
    submissionContent: string;
    submissionProof?: string;
    submissionType?: string;
  }): Promise<AiVerificationResult> {
    const prompt = buildVerificationPrompt(params);

    if (!this.genAi) {
      this.logger.warn('Gemini API key not configured, using mock verification');
      return {
        passed: true,
        score: 1.0,
        feedback: 'AI verification skipped (API key not configured)',
      };
    }

    try {
      const response = await this.generateWithModel(prompt);
      return this.parseVerificationResponse(response);
    } catch (error) {
      this.logger.error('AI verification failed, falling back to mock', error);
      return {
        passed: true,
        score: 1.0,
        feedback: 'AI verification unavailable, auto-approved as fallback',
      };
    }
  }

  async generateTask(dto: { prompt: string; category?: string }): Promise<AiTaskSuggestion> {
    if (!this.genAi) {
      this.logger.warn('Gemini API key not configured, returning mock task');
      return this.getMockTask(dto.category);
    }

    try {
      const prompt = this.buildTaskGenerationPrompt(dto);
      const response = await this.generateWithModel(prompt);
      return this.parseTaskResponse(response);
    } catch (error) {
      this.logger.error('AI task generation failed, falling back to mock', error);
      return this.getMockTask(dto.category);
    }
  }

  private buildTaskGenerationPrompt(dto: { prompt: string; category?: string }): string {
    const prompt = buildTaskGeneratorPrompt({
      userPrompt: dto.prompt,
      maxWorkers: 5,
      rewardRange: '10-500 MON',
    });

    return `${prompt}

${dto.category ? `Category hint: ${dto.category}` : ''}

Return only a JSON object in this exact shape:
{
  "title": "string (max 100 chars)",
  "description": "string (detailed, actionable)",
  "reward": "string (e.g. '25.0' for 25 MON per worker)",
  "tags": ["string", "string", "string"],
  "workersRequired": number (1-10),
  "maxWorkers": number (workersRequired-20),
  "verificationMode": "AI" | "MANUAL" | "BOTH",
  "category": "string"
}`;
  }

  private parseTaskResponse(response: string): AiTaskSuggestion {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        title: parsed.title || 'Generated Task',
        description: parsed.description || 'No description',
        reward: parsed.reward || '25.0',
        tags: parsed.tags || ['ai-generated'],
        workersRequired: parsed.workersRequired || 1,
        maxWorkers: parsed.maxWorkers || 3,
        verificationMode: parsed.verificationMode || 'AI',
        category: parsed.category || 'general',
      };
    } catch {
      return this.getMockTask();
    }
  }

  private getMockTask(category?: string): AiTaskSuggestion {
    const tasks: Record<string, AiTaskSuggestion> = {
      testing: {
        title: 'Test Website for Bugs',
        description: 'Review landing page and report 3+ bugs with screenshots',
        reward: '25.0',
        tags: ['testing', 'web', 'qa'],
        workersRequired: 3,
        maxWorkers: 5,
        verificationMode: 'AI',
        category: 'testing',
      },
      'code-review': {
        title: 'Review Solidity Smart Contract',
        description: 'Audit for reentrancy, overflow, and access control issues',
        reward: '100.0',
        tags: ['solidity', 'security', 'audit'],
        workersRequired: 2,
        maxWorkers: 3,
        verificationMode: 'MANUAL',
        category: 'code-review',
      },
      translation: {
        title: 'Translate Landing Page to Japanese',
        description: 'Translate hero section and features, maintain brand tone',
        reward: '30.0',
        tags: ['translation', 'japanese', 'localization'],
        workersRequired: 2,
        maxWorkers: 5,
        verificationMode: 'AI',
        category: 'translation',
      },
    };
    return tasks[category || 'testing'] || tasks.testing;
  }

  private parseVerificationResponse(response: string): AiVerificationResult {
    try {
      const parsed = JSON.parse(response);
      return {
        passed: parsed.passed ?? parsed.verdict === 'pass',
        score: parsed.score ?? parsed.confidence ?? 0.5,
        feedback: parsed.feedback ?? parsed.explanation ?? 'No feedback provided',
      };
    } catch {
      const passed = response.toLowerCase().includes('pass');
      const scoreMatch = response.match(/(\d+(\.\d+)?)/);
      const score = scoreMatch ? Math.min(parseFloat(scoreMatch[1]), 1.0) : 0.5;

      return {
        passed,
        score,
        feedback: response.substring(0, 500),
      };
    }
  }
}
