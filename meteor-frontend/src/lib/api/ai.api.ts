import { api } from './index';
import type { GenerateTaskDto, VerifyTaskDto, AiVerificationResult, AiTaskSuggestion } from '../../types/ai';

export const aiApi = {
  generateTask: (data: GenerateTaskDto) => 
    api.post<AiTaskSuggestion>('/ai/generate-task', data),

  verifyTask: (data: VerifyTaskDto) => 
    api.post<AiVerificationResult>('/ai/verify-task', data),
};