import { api } from './index';
import type { Notification, QueryNotificationsDto } from '../../types/notification';
import type { ApiResponse, PaginatedResponse } from '../../types';

// Backend returns wrapped responses: {statusCode, message, data: T, ...}
export const notificationsApi = {
  list: (params?: QueryNotificationsDto) =>
    api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', params),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<{ count: number }>>('/notifications/read-all'),

  delete: (id: string) =>
    api.delete<ApiResponse<void>>(`/notifications/${id}`),
};
