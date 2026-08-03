// User types
import type { Address, Timestamp } from './base';

export type User = {
  id: string;
  walletAddress: Address;
  username: string | null;
  reputation: number;
  completedTasks: number;
  createdAt: Timestamp;
  avatarUrl?: string;
  bio?: string;
  role: 'USER' | 'ADMIN';
};

// Backend returns wrapped responses: {statusCode, message, data, timestamp, path}
export type NonceRequest = { address: Address };
export type NonceResponse = { 
  statusCode: number;
  message: string;
  data: { nonce: string; walletAddress: string };
  timestamp: string;
  path: string;
};
export type VerifyRequest = { address: Address; signature: string; nonce?: string };

// Auth response wrapped in backend's standard response
export type AuthResponse = { 
  statusCode: number;
  message: string;
  data: { accessToken: string; refreshToken: string; user: User };
  timestamp: string;
  path: string;
};
export type RefreshRequest = { refreshToken: string };
export type RefreshResponse = { 
  statusCode: number;
  message: string;
  data: { accessToken: string; refreshToken: string };
  timestamp: string;
  path: string;
};