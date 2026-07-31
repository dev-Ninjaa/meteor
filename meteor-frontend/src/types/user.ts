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

export type NonceRequest = { address: Address };
export type NonceResponse = { nonce: string; expiresAt: Timestamp };
export type VerifyRequest = { address: Address; signature: string; nonce: string };
export type RefreshRequest = { refreshToken: string };
export type AuthResponse = { accessToken: string; refreshToken: string; user: User };