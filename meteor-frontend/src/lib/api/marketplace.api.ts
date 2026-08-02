import { api } from './index';
import type { Task, QueryTasksDto } from '../../types/task';
import type { PaginatedResponse } from '../../types';

export const marketplaceApi = {
  list: (params?: QueryTasksDto) =>
    api.get<PaginatedResponse<Task>>('/marketplace', params),

  search: (params?: QueryTasksDto) =>
    api.get<PaginatedResponse<Task>>('/marketplace/search', params),

  getTags: () =>
    api.get<string[]>('/marketplace/tags'),
};