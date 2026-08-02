// Tasks hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, marketplaceApi } from '../lib/api';
import type { CreateTaskDto, UpdateTaskDto, QueryTasksDto, Task, TaskItem, PaginatedResponse, TaskCategory, VerificationMode, EscrowStatus } from '../types';

const VALID_CATEGORIES: TaskCategory[] = [
  'AI Verification',
  'Code Debugging',
  'Design Feedback',
  'Translation',
  'Local Knowledge',
  'Data Labeling',
];

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
    submissionType: 'text',
    verificationType: task.verificationMode === 'AI' ? 'AI Verification' : task.verificationMode === 'MANUAL' ? 'Human Review' : 'Hybrid',
    verificationMode: task.verificationMode,
    escrowStatus: task.escrowStatus,
    maxWorkers: task.maxWorkers,
    aiGenerated: task.aiGenerated,
    aiPrompt: task.aiPrompt,
    tags: task.tags,
    createdById: task.createdById,
    options: [],
    createdAt: task.createdAt,
    userSubmission: undefined,
    aiSummary: undefined,
  };
};

export function useTasks(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksApi.list(params),
    select: (data) => ({
      ...data,
      data: data.data.map(transformTask),
    }),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
    select: transformTask,
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
    mutationFn: tasksApi.publish,
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
    mutationFn: tasksApi.cancel,
    onSuccess: (data) => {
      qc.setQueryData(['task', data.id], transformTask(data));
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
    select: (data) => ({
      ...data,
      data: data.data.map(transformTask),
    }),
  });
}

export function useSearchMarketplace(params?: QueryTasksDto) {
  return useQuery({
    queryKey: ['marketplace', 'search', params],
    queryFn: () => marketplaceApi.search(params),
    select: (data) => ({
      ...data,
      data: data.data.map(transformTask),
    }),
  });
}

export function useMarketplaceTags() {
  return useQuery({
    queryKey: ['marketplace', 'tags'],
    queryFn: () => marketplaceApi.getTags(),
  });
}