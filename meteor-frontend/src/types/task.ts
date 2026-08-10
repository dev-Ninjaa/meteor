// Task types
import type { Address, Timestamp, QueryParams, PaginatedResponse } from './base';
import type { SubmissionType, VerificationType, TaskCategory, Difficulty, TransactionType, TransactionStatus } from './common';

export type { PaginatedResponse };

export type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED' | 'DISPUTED';
export type VerificationMode = 'AI' | 'MANUAL' | 'BOTH';
export type EscrowStatus = 'UNLOCKED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

// Re-export shared enums from common (so they're available from task.ts)
export type { TaskCategory, Difficulty, TransactionType, TransactionStatus } from './common';

export type TaskSubmissionVerification = {
  id: string;
  status: string;
  aiScore: number | null;
  aiFeedback: string | null;
  manualNotes: string | null;
  isManual: boolean;
  verifiedById: string | null;
};

export type TaskSubmission = {
  id: string;
  content: string;
  proof: string | null;
  submissionType: string | null;
  status: string;
  claimed: boolean;
  aiScore: number | null;
  aiFeedback: string | null;
  taskId: string;
  workerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verification: TaskSubmissionVerification | null;
};

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
  submissionType: string;
  submissionOptions: string[];
  allowAiVerification: boolean;
  manualVerificationRequired: boolean;
  escrowStatus: EscrowStatus;
  createdById: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  mySubmission?: TaskSubmission | null;
  attachments?: any[];
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
  submissionType?: string;
  submissionOptions?: string[];
  allowAiVerification?: boolean;
  manualVerificationRequired?: boolean;
  tokenAddress?: Address;
  attachments?: any[];
};

export type UpdateTaskDto = Partial<CreateTaskDto>;
export type QueryTasksDto = QueryParams & { status?: TaskStatus; tag?: string; createdBy?: string; showCompleted?: boolean };
export type TaskListResponse = PaginatedResponse<Task>;

// Frontend-compatible task type (for UI components)
export type TaskItem = {
  mySubmission?: TaskSubmission | null;
  id: string;
  title: string;
  description: string;
  instructions?: string;
  requirements?: string;
  reward: string;
  rewardNum: number;
  duration: string;
  workersRequired: number;
  workersJoined: number;
  workersCompleted: number;
  category: TaskCategory;
  difficulty: Difficulty;
  creator: string;
  status: TaskStatus;
  submissionType: SubmissionType;
  verificationType: VerificationType;
  verificationMode: VerificationMode;
  escrowStatus: EscrowStatus;
  maxWorkers: number;
  aiGenerated: boolean;
  aiPrompt: string | null;
  tags: string[];
  createdById: string;
  options?: string[];
  createdAt: string;
  userSubmission?: any;
  aiSummary?: {
    overallSentiment: string;
    topFeedback: string[];
    commonProblems: string[];
    suggestions: string[];
    consensusScore: number;
  };
  attachments?: any[];
};

export type TransactionItem = {
  id: string;
  txHash: string;
  type: TransactionType;
  amount: string;
  taskTitle: string;
  status: TransactionStatus;
  timestamp: string;
  taskId?: string;
};