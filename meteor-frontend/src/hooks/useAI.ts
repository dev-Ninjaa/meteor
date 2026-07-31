// AI hooks
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../lib/api';
import type { GenerateTaskDto, VerifyTaskDto, AiVerificationResult, AiTaskSuggestion } from '../types';

export function useGenerateTask() {
  return useMutation({
    mutationFn: aiApi.generateTask,
  });
}

export function useVerifyTask() {
  return useMutation({
    mutationFn: aiApi.verifyTask,
  });
}