// Payments hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import type { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, QueryTransactionsDto, Transaction, PaginatedResponse } from '../types';

export function useTransactions(params?: QueryTransactionsDto) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => paymentsApi.list(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => paymentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.createEscrow,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}

export function useReleaseEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.releaseEscrow,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}

export function useRefundEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.refundEscrow,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['task', data.taskId] });
    },
  });
}