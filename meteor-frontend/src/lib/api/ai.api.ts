import { api } from './index';
import type { GenerateTaskDto, VerifyTaskDto, AiVerificationResult, AiTaskSuggestion } from '../../types/ai';

// Backend wraps all responses: {statusCode, message, data: T, timestamp, path}
export const aiApi = {
  generateTask: (data: GenerateTaskDto) => 
    api.post<{ statusCode: number; message: string; data: AiTaskSuggestion; timestamp: string; path: string }>('/ai/generate-task', data),

  verifyTask: (data: VerifyTaskDto) => 
    api.post<{ statusCode: number; message: string; data: AiVerificationResult; timestamp: string; path: string }>('/ai/verify-task', data),
};
