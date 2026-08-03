import { api } from './index';
import type { User, NonceResponse, AuthResponse, VerifyRequest, RefreshRequest, NonceRequest, RefreshResponse } from '../../types/user';

// Backend returns wrapped responses for ALL endpoints: {statusCode, message, data: T, ...}
export const authApi = {
  getNonce: (data: NonceRequest) => 
    api.post<NonceResponse>('/auth/nonce', { walletAddress: data.address }),

  verify: (data: VerifyRequest) => 
    api.post<AuthResponse>('/auth/verify', { walletAddress: data.address, signature: data.signature }),

  refresh: (data: RefreshRequest) => 
    api.post<RefreshResponse>('/auth/refresh', data),

  logout: () => 
    api.post('/auth/logout'),

  me: () => 
    api.get<{ statusCode: number; message: string; data: User; timestamp: string; path: string }>('/users/me'),

  updateMe: (data: Partial<User>) => 
    api.patch<{ statusCode: number; message: string; data: User; timestamp: string; path: string }>('/users/me', data),
};