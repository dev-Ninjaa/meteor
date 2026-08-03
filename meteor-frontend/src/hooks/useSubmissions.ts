// Submissions hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi } from '../lib/api';
import type { CreateSubmissionDto, ManualVerifyDto, Submission } from '../types';

export function useSubmissionsByTask(taskId: string) {
  return useQuery({
    queryKey: ['submissions', 'task', taskId],
    queryFn: async () => {
      const response = await submissionsApi.listByTask(taskId);
      return response.data;
    },
    enabled: !!taskId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const response = await submissionsApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CreateSubmissionDto }) => 
      submissionsApi.create(taskId, data),
    onSuccess: (data, variables) => {
      // Backend returns wrapped response: {statusCode, message, data: Submission}
      const submission = data.data;
      qc.invalidateQueries({ queryKey: ['submissions', 'task', variables.taskId] });
      qc.invalidateQueries({ queryKey: ['task', variables.taskId] });
    },
  });
}

export function useVerifySubmissionAi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submissionsApi.verifyAi,
    onSuccess: (data) => {
      const submission = data.data;
      qc.setQueryData(['submission', submission.id], submission);
      qc.invalidateQueries({ queryKey: ['submissions', 'task', submission.taskId] });
    },
  });
}

export function useVerifySubmissionManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: ManualVerifyDto }) => 
      submissionsApi.verifyManual(submissionId, data),
    onSuccess: (data) => {
      const submission = data.data;
      qc.setQueryData(['submission', submission.id], submission);
      qc.invalidateQueries({ queryKey: ['submissions', 'task', submission.taskId] });
    },
  });
}

export function useVerification(submissionId: string) {
  return useQuery({
    queryKey: ['verification', submissionId],
    queryFn: async () => {
      const response = await submissionsApi.getVerification(submissionId);
      return response.data.verification;
    },
    enabled: !!submissionId,
  });
}

// Aggregated hook for components that need multiple submission operations
export function useSubmissions() {
  const createSubmission = useCreateSubmission();
  const verifyAi = useVerifySubmissionAi();
  const verifyManual = useVerifySubmissionManual();
  
  return {
    create: createSubmission,
    verifyAi,
    verifyManual,
  };
}