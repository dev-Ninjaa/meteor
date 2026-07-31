import { api } from './index';
import type { User, NonceResponse, AuthResponse, VerifyRequest, RefreshRequest, NonceRequest } from '../../types/user';

export const authApi = {
  getNonce: (data: NonceRequest) => 
    api.post<NonceResponse>('/auth/nonce', data),

  verify: (data: VerifyRequest) => 
    api.post<AuthResponse>('/auth/verify', data),

  refresh: (data: RefreshRequest) => 
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', data),

  logout: () => 
    api.post('/auth/logout'),

  me: () => 
    api.get<User>('/users/me'),

  updateMe: (data: Partial<User>) => 
    api.patch<User>('/users/me', data),
};