// Payments hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import type { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, QueryTransactionsDto, Transaction, PaginatedResponse } from '../types';

export function useTransactions(params?: QueryTransactionsDto) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const response = await paymentsApi.list(params);
      // Backend returns wrapped response: {statusCode, message, data: PaginatedResponse<Transaction>}
      return response.data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await paymentsApi.get(id);
      // Backend returns wrapped response: {statusCode, message, data: Transaction}
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEscrowDto) => {
      const response = await paymentsApi.createEscrow(data);
      // Backend returns wrapped response: {statusCode, message, data: Transaction}
      return response.data;
    },
    onSuccess: (data: Transaction) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}

export function useReleaseEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReleaseEscrowDto) => {
      const response = await paymentsApi.releaseEscrow(data);
      // Backend returns wrapped response: {statusCode, message, data: Transaction}
      return response.data;
    },
    onSuccess: (data: Transaction) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}

export function useRefundEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: RefundEscrowDto) => {
      const response = await paymentsApi.refundEscrow(data);
      // Backend returns wrapped response: {statusCode, message, data: Transaction}
      return response.data;
    },
    onSuccess: (data: Transaction) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}

// Aggregated hook for WalletView
export function usePayments() {
  const { data: transactionsResponse, isLoading } = useTransactions();
  const transactions = transactionsResponse?.data || [];
  
  const totalEarnings = transactions
    .filter((t: Transaction) => t.amount.startsWith('+'))
    .reduce((acc: number, t: Transaction) => acc + parseFloat(t.amount.replace('+', '').replace(' MON', '')), 0)
    .toFixed(1);

  const totalSpending = transactions
    .filter((t: Transaction) => t.amount.startsWith('-'))
    .reduce((acc: number, t: Transaction) => acc + Math.abs(parseFloat(t.amount.replace('-', '').replace(' MON', ''))), 0)
    .toFixed(1);

  const pendingRewards = transactions
    .filter((t: Transaction) => t.status === 'PENDING' && t.amount.startsWith('+'))
    .reduce((acc: number, t: Transaction) => acc + parseFloat(t.amount.replace('+', '').replace(' MON', '')), 0);

  const createEscrow = useCreateEscrow();
  const releaseEscrow = useReleaseEscrow();
  const refundEscrow = useRefundEscrow();

  return {
    transactions,
    isLoading,
    totalEarnings,
    totalSpending,
    pendingRewards,
    createEscrow,
    releaseEscrow,
    refundEscrow,
    claimPayment: null, // Would be wagmi hook
  };
}