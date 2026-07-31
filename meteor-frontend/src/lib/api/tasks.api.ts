import { api } from './client';
import type { Task, CreateTaskDto, UpdateTaskDto, QueryTasksDto, PaginatedResponse } from '../../types/task';

export const tasksApi = {
  list: (params?: QueryTasksDto) => 
    api.get<PaginatedResponse<Task>>('/tasks', params as Record<string, string | number | boolean | undefined>),

  get: (id: string) => 
    api.get<Task>(`/tasks/${id}`),

  create: (data: CreateTaskDto) => 
    api.post<Task>('/tasks', data),

  update: (id: string, data: UpdateTaskDto) => 
    api.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) => 
    api.delete(`/tasks/${id}`),

  publish: (id: string) => 
    api.post<Task>(`/tasks/${id}/publish`),

  cancel: (id: string) => 
    api.post<Task>(`/tasks/${id}/cancel`),

  join: (id: string) => 
    api.post(`/tasks/${id}/join`),

  leave: (id: string) => 
    api.post(`/tasks/${id}/leave`),
};