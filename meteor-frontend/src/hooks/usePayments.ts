// Payments hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import { useMe } from './useAuth';
import type { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, ClaimEscrowDto, QueryTransactionsDto, Transaction, PaginatedResponse } from '../types';

// Backend amount is a plain Decimal string (no sign) — direction must come from tx.type
export const INCOMING_TX_TYPES = ['CLAIM_PAYMENT', 'ESCROW_RELEASE', 'ESCROW_REFUND'];
export const OUTGOING_TX_TYPES = ['ESCROW_CREATE'];

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

export function useClaimEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClaimEscrowDto) => {
      const response = await paymentsApi.claimEscrow(data);
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
  const { data: me } = useMe();
  const { data: transactionsResponse, isLoading } = useTransactions({
    userId: me?.id,
  });
  const transactions = transactionsResponse?.data || [];

  const totalEarnings = transactions
    .filter((t: Transaction) => INCOMING_TX_TYPES.includes(t.type))
    .reduce((acc: number, t: Transaction) => acc + parseFloat(t.amount), 0)
    .toFixed(1);

  const totalSpending = transactions
    .filter((t: Transaction) => OUTGOING_TX_TYPES.includes(t.type))
    .reduce((acc: number, t: Transaction) => acc + parseFloat(t.amount), 0)
    .toFixed(1);

  const pendingRewards = transactions
    .filter((t: Transaction) => t.status === 'PENDING' && INCOMING_TX_TYPES.includes(t.type))
    .reduce((acc: number, t: Transaction) => acc + parseFloat(t.amount), 0);

  const createEscrow = useCreateEscrow();
  const releaseEscrow = useReleaseEscrow();
  const refundEscrow = useRefundEscrow();
  const claimPayment = useClaimEscrow();

  return {
    transactions,
    isLoading,
    totalEarnings,
    totalSpending,
    pendingRewards,
    createEscrow,
    releaseEscrow,
    refundEscrow,
    claimPayment,
  };
}