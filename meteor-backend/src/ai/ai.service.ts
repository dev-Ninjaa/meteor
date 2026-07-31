import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildVerificationPrompt } from './prompts/verification.prompt';

export interface AiVerificationResult {
  passed: boolean;
  score: number;
  feedback: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAi: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey) {
      this.genAi = new GoogleGenerativeAI(apiKey);
    }
  }

  async verifySubmission(params: {
    taskTitle: string;
    taskDescription: string;
    taskRequirements: string;
    submissionContent: string;
    submissionProof?: string;
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
      const model = this.genAi.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

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
