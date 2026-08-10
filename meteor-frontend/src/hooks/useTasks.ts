// Tasks hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, marketplaceApi } from '../lib/api';
import type { CreateTaskDto, UpdateTaskDto, QueryTasksDto, Task, TaskItem, PaginatedResponse, TaskCategory, VerificationMode, EscrowStatus } from '../types';
import { VALID_CATEGORIES } from '../constants/tasks';

// Helper to transform backend Task to frontend TaskItem
const transformTask = (task: Task): TaskItem => {
  const category = task.tags[0] && VALID_CATEGORIES.includes(task.tags[0] as TaskCategory)
    ? task.tags[0] as TaskCategory
    : 'AI Verification';
  
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    instructions: '',
    requirements: '',
    reward: task.reward,
    rewardNum: parseFloat(task.reward.replace(' MON', '')) || 0,
    duration: '10 mins',
    workersRequired: task.workersRequired,
    workersJoined: task.workersJoined,
    workersCompleted: task.workersCompleted,
    category,
    difficulty: 'Medium',
    creator: task.createdById,
    status: task.status,
    submissionType: (task.submissionType as TaskItem['submissionType']) || 'text',
    verificationType: task.verificationMode === 'AI' ? 'AI Verification' : task.verificationMode === 'MANUAL' ? 'Human Review' : 'Hybrid',
    verificationMode: task.verificationMode,
    escrowStatus: task.escrowStatus,
    maxWorkers: task.maxWorkers,
    aiGenerated: task.aiGenerated,
    aiPrompt: task.aiPrompt,
    tags: task.tags,
    createdById: task.createdById,
    options: task.submissionOptions || [],
    createdAt: task.createdAt,
    mySubmission: task.mySubmission ?? undefined,
    userSubmission: task.mySubmission?.content,
    aiSummary: undefined,
  };
};

export function useTasks(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.list(params),
    select: (response: { data: { data: Task[]; total: number; page: number; limit: number; totalPages: number } }) => {
      const paginatedData = response?.data;
      if (!paginatedData) return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      return {
        ...paginatedData,
        data: paginatedData.data.map(transformTask),
      };
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
    select: (response) => {
      const data = response?.data;
      if (!data) return null;
      return transformTask(data);
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskDto) => {
      const response = await tasksApi.create(data);
      // Backend returns wrapped response: {statusCode, message, data: Task}
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDto }) => {
      const response = await tasksApi.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      qc.setQueryData(['task', variables.id], transformTask(data));
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
    mutationFn: async (id: string) => {
      const response = await tasksApi.publish(id);
      return response.data as any; // includes escrowData
    },
    onSuccess: (data) => {
      qc.setQueryData(['task', data.id], transformTask(data));
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useCancelTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await tasksApi.cancel(id);
      return response.data;
    },
    onSuccess: (data) => {
      qc.setQueryData(['task', data.id], transformTask(data));
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useJoinTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await tasksApi.join(id);
      return response.data;
    },
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useLeaveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await tasksApi.leave(id);
      return response.data;
    },
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
    select: (response: { data: { data: Task[]; total: number; page: number; limit: number; totalPages: number } }) => {
      const paginatedData = response?.data;
      if (!paginatedData) return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      return {
        ...paginatedData,
        data: paginatedData.data.map(transformTask),
      };
    },
  });
}

export function useSearchMarketplace(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['marketplace', 'search', params],
    queryFn: () => marketplaceApi.search(params),
    select: (response: { data: { data: Task[]; total: number; page: number; limit: number; totalPages: number } }) => {
      const paginatedData = response?.data;
      if (!paginatedData) return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      return {
        ...paginatedData,
        data: paginatedData.data.map(transformTask),
      };
    },
  });
}

export function useMarketplaceTags() {
  return useQuery({
    queryKey: ['marketplace', 'tags'],
    queryFn: () => marketplaceApi.getTags(),
  });
}