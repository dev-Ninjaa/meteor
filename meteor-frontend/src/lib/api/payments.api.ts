import { api } from './index';
import type { Transaction, CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, QueryTransactionsDto } from '../../types/payment';
import type { PaginatedResponse } from '../../types';

export const paymentsApi = {
  createEscrow: (data: CreateEscrowDto) => 
    api.post<Transaction>('/payments/escrow/create', data),

  releaseEscrow: (data: ReleaseEscrowDto) => 
    api.post<Transaction>('/payments/escrow/release', data),

  refundEscrow: (data: RefundEscrowDto) => 
    api.post<Transaction>('/payments/escrow/refund', data),

  list: (params?: QueryTransactionsDto) => 
    api.get<PaginatedResponse<Transaction>>('/payments/transactions', params),

  get: (id: string) => 
    api.get<Transaction>(`/payments/transactions/${id}`),
};