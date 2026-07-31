import { api } from './index';
import type { Submission, CreateSubmissionDto, ManualVerifyDto, Verification } from '../../types/submission';
import type { AiVerifyResult } from '../../types/ai';

export const submissionsApi = {
  listByTask: (taskId: string) => 
    api.get<Submission[]>(`/submissions/task/${taskId}`),

  get: (id: string) => 
    api.get<Submission>(`/submissions/${id}`),

  create: (taskId: string, data: CreateSubmissionDto) => 
    api.post<Submission>('/submissions', { taskId, ...data }),

  verifyAi: (submissionId: string) => 
    api.post<Submission>(`/submissions/${submissionId}/verify/ai`),

  verifyManual: (submissionId: string, data: ManualVerifyDto) => 
    api.post<Submission>(`/submissions/${submissionId}/verify/manual`, data),

  getVerification: (submissionId: string) => 
    api.get<{ verification: Verification }>(`/submissions/${submissionId}/verification`),
};