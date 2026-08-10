// Notifications hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api';
import type { QueryNotificationsDto, Notification, PaginatedResponse } from '../types';

export function useNotifications(params?: QueryNotificationsDto, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationsApi.list(params);
      return response.data;
    },
    enabled: options?.enabled,
    refetchInterval: 30000,
  });
}

export function useUnreadCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data.count;
    },
    enabled: options?.enabled,
    refetchInterval: 30000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

// Exported as an object for easier access
export const notificationsHooks = {
  useList: useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDelete: useDeleteNotification,
};