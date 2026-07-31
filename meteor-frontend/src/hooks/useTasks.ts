// Tasks hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, marketplaceApi } from '../lib/api';
import type { CreateTaskDto, UpdateTaskDto, QueryTasksDto, Task, PaginatedResponse } from '../types';

export function useTasks(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.list(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) => tasksApi.update(id, data),
    onSuccess: (data, variables) => {
      qc.setQueryData(['task', variables.id], data);
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.removeQueries({ queryKey: ['task', id] });
    },
  });
}

export function usePublishTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.publish,
    onSuccess: (data) => {
      qc.setQueryData(['task', data.id], data);
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useCancelTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.cancel,
    onSuccess: (data) => {
      qc.setQueryData(['task', data.id], data);
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useJoinTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.join,
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useLeaveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.leave,
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Marketplace hooks
export function useMarketplace(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['marketplace', params],
    queryFn: () => marketplaceApi.list(params),
  });
}

export function useSearchMarketplace(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['marketplace', 'search', params],
    queryFn: () => marketplaceApi.search(params),
  });
}