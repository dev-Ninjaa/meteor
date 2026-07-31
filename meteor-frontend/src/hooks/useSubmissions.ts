// Submissions hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi } from '../lib/api';
import type { CreateSubmissionDto, ManualVerifyDto, Submission } from '../types';

export function useSubmissionsByTask(taskId: string) {
  return useQuery({
    queryKey: ['submissions', 'task', taskId],
    queryFn: () => submissionsApi.listByTask(taskId),
    enabled: !!taskId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CreateSubmissionDto }) => 
      submissionsApi.create(taskId, data),
    onSuccess: (data, variables) => {
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
      qc.setQueryData(['submission', data.id], data);
      qc.invalidateQueries({ queryKey: ['submissions', 'task', data.taskId] });
    },
  });
}

export function useVerifySubmissionManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: ManualVerifyDto }) => 
      submissionsApi.verifyManual(submissionId, data),
    onSuccess: (data) => {
      qc.setQueryData(['submission', data.id], data);
      qc.invalidateQueries({ queryKey: ['submissions', 'task', data.taskId] });
    },
  });
}

export function useVerification(submissionId: string) {
  return useQuery({
    queryKey: ['verification', submissionId],
    queryFn: () => submissionsApi.getVerification(submissionId),
    enabled: !!submissionId,
  });
}