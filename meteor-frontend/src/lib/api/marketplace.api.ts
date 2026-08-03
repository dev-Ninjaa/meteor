import { api } from './index';
import type { Task, QueryTasksDto } from '../../types/task';
import type { PaginatedResponse } from '../../types';

// Backend returns wrapped responses: {statusCode, message, data: T, timestamp, path}
export const marketplaceApi = {
  list: (params?: QueryTasksDto & { showCompleted?: boolean }) => 
    api.get<{ statusCode: number; message: string; data: PaginatedResponse<Task>; timestamp: string; path: string }>('/marketplace', params),

  search: (params?: QueryTasksDto & { showCompleted?: boolean }) => 
    api.get<{ statusCode: number; message: string; data: PaginatedResponse<Task>; timestamp: string; path: string }>('/marketplace/search', params),

  getTags: () => 
    api.get<{ statusCode: number; message: string; data: string[]; timestamp: string; path: string }>('/marketplace/tags'),
};