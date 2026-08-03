import { api } from './client';
import type { PaginatedResponse } from '../../types/task';

export interface DashboardTaskResponse {
  id: string;
  title: string;
  description: string;
  reward: string;
  tokenAddress: string | null;
  status: string;
  aiGenerated: boolean;
  tags: string[];
  workersRequired: number;
  workersJoined: number;
  workersCompleted: number;
  maxWorkers: number;
  verificationMode: string;
  allowAiVerification: boolean;
  manualVerificationRequired: boolean;
  escrowStatus: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  myRole: 'creator' | 'worker' | 'joined';
  mySubmission?: {
    id: string;
    status: string;
    content: string;
    createdAt: Date;
    verification?: {
      status: string;
      score?: number;
    };
  };
}

export interface DashboardTabResponse {
  data: DashboardTaskResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardResponse {
  created: DashboardTabResponse;
  submitted: DashboardTabResponse;
  joined: DashboardTabResponse;
}

export const dashboardApi = {
  getDashboard: (params?: { page?: number; limit?: number; tab?: string; status?: string }) =>
    api.get<{ statusCode: number; message: string; data: DashboardResponse; timestamp: string; path: string }>('/dashboard', params),

  getCreated: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ statusCode: number; message: string; data: DashboardTabResponse; timestamp: string; path: string }>('/dashboard/created', params),

  getSubmitted: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ statusCode: number; message: string; data: DashboardTabResponse; timestamp: string; path: string }>('/dashboard/submitted', params),

  getJoined: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ statusCode: number; message: string; data: DashboardTabResponse; timestamp: string; path: string }>('/dashboard/joined', params),
};