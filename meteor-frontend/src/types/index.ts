// Type exports - single source of truth for all types
// Explicitly re-export to avoid duplicate identifier errors

export * from './base';

// From task.ts - core task types
export type {
  PaginatedResponse,
  TaskStatus,
  VerificationMode,
  EscrowStatus,
  TaskCategory,
  Difficulty,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  QueryTasksDto,
  TaskListResponse,
  TaskItem,
  TransactionItem,
  TransactionType,
  TransactionStatus,
} from './task';

// From submission.ts - submission types
export type {
  SubmissionStatus,
  VerificationStatus,
  Submission,
  Verification,
  CreateSubmissionDto,
  ManualVerifyDto,
  AiVerifyResult,
} from './submission';

// From notification.ts - notification types
export * from './notification';

// From user.ts - user types
export * from './user';

// From ai.ts - AI types
export * from './ai';

// From payment.ts - payment types
export type {
  TransactionStatus as PaymentTransactionStatus,
  Transaction,
  CreateEscrowDto,
  ReleaseEscrowDto,
  RefundEscrowDto,
  ClaimEscrowDto,
  QueryTransactionsDto,
  TransactionListResponse,
} from './payment';

// From common.ts - shared enums
export * from './common';