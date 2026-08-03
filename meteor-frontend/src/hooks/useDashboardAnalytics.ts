import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import { useAccount, useBalance } from 'wagmi';
import { useDashboardCreated, useDashboardSubmitted, useDashboardJoined } from './useDashboard';

export function useDashboardAnalytics() {
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { data: createdData } = useDashboardCreated();
  const { data: submittedData } = useDashboardSubmitted();
  const { data: joinedData } = useDashboardJoined();

  // Fetch transactions for earnings/spending
  const { data: transactionsResponse } = useQuery({
    queryKey: ['dashboard-transactions', address],
    queryFn: async () => {
      const response = await paymentsApi.list({ userId: address });
      return response.data.data;
    },
    enabled: !!address,
  });

  const transactions = transactionsResponse || [];

  // Calculate real metrics from backend data
  const createdTasks = createdData?.data || [];
  const submittedTasks = submittedData?.data || [];
  const joinedTasks = joinedData?.data || [];

  // Total tasks created by user
  const totalTasksCreated = createdData?.total || 0;

  // Total MON spent on escrow locks (creator)
  const totalSpent = createdTasks.reduce((acc: number, t: any) => {
    const reward = parseFloat(t.reward) || 0;
    const maxWorkers = t.maxWorkers || t.workersRequired || 1;
    return acc + (reward * maxWorkers);
  }, 0).toFixed(1);

  // Total earnings from completed tasks (worker)
  const completedSubmissions = submittedTasks.filter(
    (t: any) => t.status === 'COMPLETED' && t.mySubmission?.verification?.status === 'PASSED'
  );
  const totalEarned = completedSubmissions.reduce((acc: number, t: any) => {
    return acc + (parseFloat(t.reward) || 0);
  }, 0).toFixed(1);

  // Pending rewards (submitted but not yet verified)
  const pendingRewards = submittedTasks
    .filter((t: any) => t.mySubmission && !t.mySubmission?.verification)
    .reduce((acc: number, t: any) => acc + (parseFloat(t.reward) || 0), 0).toFixed(1);

  // Total spent on joining tasks (as creator, this is escrow locks)
  const totalEscrowLocked = transactions
    .filter((t: any) => t.type === 'ESCROW_LOCK')
    .reduce((acc: number, t: any) => acc + parseFloat(t.amount.replace('+', '').replace(' MON', '')), 0).toFixed(1);

  // Total claimed from contract (worker payouts)
  const totalClaimed = transactions
    .filter((t: any) => t.type === 'CLAIM_PAYMENT')
    .reduce((acc: number, t: any) => acc + parseFloat(t.amount.replace('+', '').replace(' MON', '')), 0).toFixed(1);

  // Consensus score (mock - would need verification data)
  const avgConsensus = completedSubmissions.length > 0
    ? (completedSubmissions.reduce((acc, t) => acc + (t.mySubmission?.verification?.score || 100), 0) / completedSubmissions.length).toFixed(1)
    : '93.8';

  return {
    // Wallet data
    balance: balanceData ? (Number(balanceData.value) / 10 ** balanceData.decimals).toFixed(4) : '0.0',
    address: address?.slice(0, 6) + '...' + address?.slice(-4) || 'Not connected',

    // Task metrics
    totalTasksCreated,
    totalTasksJoined: joinedData?.total || 0,
    totalTasksSubmitted: submittedData?.total || 0,
    totalTasksCompleted: completedSubmissions.length,

    // Financial metrics
    totalSpent: parseFloat(totalSpent),
    totalEarned: parseFloat(totalEarned),
    totalEscrowLocked: parseFloat(totalEscrowLocked),
    totalClaimed: parseFloat(totalClaimed),
    pendingRewards: parseFloat(pendingRewards),

    // Verification metrics
    avgConsensus: parseFloat(avgConsensus),
    consensusCount: completedSubmissions.length,

    // Task lists
    createdTasks,
    submittedTasks,
    joinedTasks,

    // Transactions for on-chain activity
    transactions,

    // Loading states
    isLoading: false,
  };
}