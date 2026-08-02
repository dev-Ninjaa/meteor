// Payment types
import type { Timestamp, PaginatedResponse, QueryParams, Address } from './base';

export type { PaginatedResponse };

export type TransactionStatus = 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'CANCELLED';

export type Transaction = {
  id: string;
  amount: string;
  tokenAddress: Address | null;
  txHash: string | null;
  chainId: number | null;
  blockNumber: string | null;
  gasUsed: string | null;
  status: TransactionStatus;
  type: string;
  taskId: string;
  userId: string;
  taskTitle: string;
  timestamp: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateEscrowDto = {
  taskId: string;
  amount?: string;
};

export type ReleaseEscrowDto = {
  taskId: string;
  submissionId: string;
};

export type RefundEscrowDto = {
  taskId: string;
  reason?: string;
};

export type QueryTransactionsDto = QueryParams & {
  status?: TransactionStatus;
  type?: string;
  taskId?: string;
  userId?: string;
};

export type TransactionListResponse = PaginatedResponse<Transaction>;