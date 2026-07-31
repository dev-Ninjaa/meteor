// Task types
import type { Address, Timestamp, QueryParams, PaginatedResponse } from './base';

export type { PaginatedResponse };

export type TaskStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type VerificationMode = 'AI' | 'MANUAL' | 'BOTH';
export type EscrowStatus = 'UNLOCKED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

export type Task = {
  id: string;
  title: string;
  description: string;
  reward: string;
  tokenAddress: Address | null;
  status: TaskStatus;
  aiGenerated: boolean;
  aiPrompt: string | null;
  tags: string[];
  workersRequired: number;
  workersJoined: number;
  workersCompleted: number;
  maxWorkers: number;
  verificationMode: VerificationMode;
  allowAiVerification: boolean;
  manualVerificationRequired: boolean;
  escrowStatus: EscrowStatus;
  createdById: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateTaskDto = {
  title: string;
  description: string;
  reward: string;
  deadline?: Timestamp;
  tags?: string[];
  workersRequired?: number;
  maxWorkers?: number;
  verificationMode?: VerificationMode;
  allowAiVerification?: boolean;
  manualVerificationRequired?: boolean;
  tokenAddress?: Address;
};

export type UpdateTaskDto = Partial<CreateTaskDto>;
export type QueryTasksDto = QueryParams & { status?: TaskStatus; tag?: string; createdBy?: string };
export type TaskListResponse = PaginatedResponse<Task>;