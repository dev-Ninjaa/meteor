// Auth hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async ({ address, signature, nonce }: { address: string; signature: string; nonce: string }) => {
      return authApi.verify({ address, signature, nonce });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return { login, logout };
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