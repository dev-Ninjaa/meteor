import { api } from './index';
import type { Submission, CreateSubmissionDto, ManualVerifyDto, Verification, AiVerifyResult } from '../../types/submission';

export const submissionsApi = {
  listByTask: (taskId: string) => 
    api.get<{ statusCode: number; message: string; data: Submission[]; timestamp: string; path: string }>(`/tasks/${taskId}/submissions`),

  get: (id: string) => 
    api.get<{ statusCode: number; message: string; data: Submission; timestamp: string; path: string }>(`/submissions/${id}`),

  create: (taskId: string, data: CreateSubmissionDto) => 
    api.post<{ statusCode: number; message: string; data: Submission; timestamp: string; path: string }>(`/tasks/${taskId}/submissions`, data),

  verifyAi: (submissionId: string) => 
    api.post<{ statusCode: number; message: string; data: Submission; timestamp: string; path: string }>(`/submissions/${submissionId}/verify/ai`),

  verifyManual: (submissionId: string, data: ManualVerifyDto) => 
    api.post<{ statusCode: number; message: string; data: Submission; timestamp: string; path: string }>(`/submissions/${submissionId}/verify/manual`, data),

  getVerification: (submissionId: string) => 
    api.get<{ statusCode: number; message: string; data: { verification: Verification }; timestamp: string; path: string }>(`/submissions/${submissionId}/verification`),
};