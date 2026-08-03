import { api } from './index';
import type { Transaction, CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, QueryTransactionsDto } from '../../types/payment';
import type { PaginatedResponse } from '../../types';

// Backend returns wrapped responses: {statusCode, message, data: T, ...}
export const paymentsApi = {
  createEscrow: (data: CreateEscrowDto) => 
    api.post<{ statusCode: number; message: string; data: Transaction; timestamp: string; path: string }>('/payments/escrow/create', data),

  releaseEscrow: (data: ReleaseEscrowDto) => 
    api.post<{ statusCode: number; message: string; data: Transaction; timestamp: string; path: string }>('/payments/escrow/release', data),

  refundEscrow: (data: RefundEscrowDto) => 
    api.post<{ statusCode: number; message: string; data: Transaction; timestamp: string; path: string }>('/payments/escrow/refund', data),

  list: (params?: QueryTransactionsDto) => 
    api.get<{ statusCode: number; message: string; data: PaginatedResponse<Transaction>; timestamp: string; path: string }>('/payments/transactions', params),

  get: (id: string) => 
    api.get<{ statusCode: number; message: string; data: Transaction; timestamp: string; path: string }>(`/payments/transactions/${id}`),
};