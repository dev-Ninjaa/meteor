import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';

export function useDashboard(params?: { page?: number; limit?: number; tab?: string; status?: string }) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: async () => {
      const response = await dashboardApi.getDashboard(params);
      return response.data;
    },
  });
}

export function useDashboardCreated(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['dashboard', 'created', params],
    queryFn: async () => {
      const response = await dashboardApi.getCreated(params);
      return response.data;
    },
  });
}

export function useDashboardSubmitted(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['dashboard', 'submitted', params],
    queryFn: async () => {
      const response = await dashboardApi.getSubmitted(params);
      return response.data;
    },
  });
}

export function useDashboardJoined(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['dashboard', 'joined', params],
    queryFn: async () => {
      const response = await dashboardApi.getJoined(params);
      return response.data;
    },
  });
}