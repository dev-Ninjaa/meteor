// Auth hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, api } from '../lib/api';
import type { Address } from '../types/base';

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async ({ address, signature, nonce }: { address: string; signature: string; nonce: string }) => {
      return authApi.verify({ address: address as Address, signature, nonce });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data.user);
      // Store token for socket connection
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        // IMPORTANT: Set token on api client
        api.setToken(data.accessToken);
      }
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        api.setToken(null);
      }
    },
  });

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // Initialize api client with token from localStorage on app start
  const initializeAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        api.setToken(token);
      }
    }
  };

  return { login, logout, getToken, initializeAuth };
}

export function useMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}