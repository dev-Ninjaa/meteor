// Auth hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, api } from '../lib/api';
import type { Address } from '../types/base';
import type { AuthResponse, User } from '../types/user';

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
      mutationFn: async ({ walletAddress, signature, nonce }: { walletAddress: string; signature: string; nonce?: string }) => {
        // Backend's verify endpoint expects walletAddress and signature
        // The nonce is stored in DB when /auth/nonce is called
        // Don't send nonce - backend reads it from DB
        return authApi.verify({ address: walletAddress as Address, signature });
      },
    onSuccess: (data: AuthResponse) => {
      // Backend returns wrapped response: {statusCode, message, data: {user, accessToken, refreshToken}}
      const authData = data?.data;
      const user = authData?.user;
      const accessToken = authData?.accessToken;
      const refreshToken = authData?.refreshToken;
      
      // Store token FIRST so components gating on getToken() see it on the next render,
      // then populate the user cache (which triggers the reactive re-render).
      if (typeof window !== 'undefined') {
        console.log('[useAuth] Storing tokens:', { accessToken: accessToken?.slice(0, 20) + '...', refreshToken: refreshToken?.slice(0, 20) + '...' });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        // IMPORTANT: Set token on api client
        api.setToken(accessToken);
        console.log('[useAuth] Token set on api client, localStorage:', localStorage.getItem('accessToken')?.slice(0, 20) + '...');
      }
      queryClient.setQueryData(['user', 'me'], user);
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        api.setToken(null);
      }
      queryClient.clear();
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

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await authApi.me();
      // Backend returns wrapped response: {statusCode, message, data: User}
      return response.data;
    },
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (data) => {
      // Backend returns wrapped response: {statusCode, message, data: User}
      const userData = data?.data;
      queryClient.setQueryData(['user', 'me'], userData);
    },
  });
}