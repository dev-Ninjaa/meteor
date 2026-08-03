import { api } from './client';
import type { Task, CreateTaskDto, UpdateTaskDto ,QueryTasksDto, PaginatedResponse } from '../../types/task';

export const tasksApi = {
  list: (params?: QueryTasksDto) =>
    api.get<{ statusCode: number; message: string; data: PaginatedResponse<Task>; timestamp: string; path: string }>('/tasks', params as Record<string, string | number | boolean | undefined>),

  get: (id: string) =>
    api.get<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>(`/tasks/${id}`),

  create: (data: CreateTaskDto) =>
    api.post<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>('/tasks', data),

  update: (id: string, data: UpdateTaskDto) =>
    api.patch<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>(`/tasks/${id}`, data),

  delete: (id: string) =>
    api.delete<{ statusCode: number; message: string; data: null; timestamp: string; path: string }>(`/tasks/${id}`),

  publish: (id: string) =>
    api.post<{ statusCode: number; message: string; 
      data: Task & { escrowData: { taskId: string; rewardPerWorker: string; maxWorkers: number; totalAmount: string; escrowContractAddress: string } }; 
      timestamp: string; path: string }>(`/tasks/${id}/publish`),

  cancel: (id: string) =>
    api.post<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>(`/tasks/${id}/cancel`),

  join: (id: string) =>
    api.post<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>(`/tasks/${id}/join`),

  leave: (id: string) =>
    api.post<{ statusCode: number; message: string; data: Task; timestamp: string; path: string }>(`/tasks/${id}/leave`),
};