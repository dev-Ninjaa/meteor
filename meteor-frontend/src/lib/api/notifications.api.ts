import { api } from './index';
import type { Notification, QueryNotificationsDto } from '../../types/notification';
import type { PaginatedResponse } from '../../types';

export const notificationsApi = {
  list: (params?: QueryNotificationsDto) => 
    api.get<PaginatedResponse<Notification>>('/notifications', params),

  markRead: (id: string) => 
    api.patch(`/notifications/${id}/read`),

  markAllRead: () => 
    api.patch('/notifications/read-all'),
};