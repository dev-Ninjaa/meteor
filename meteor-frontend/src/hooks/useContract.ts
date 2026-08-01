import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, BOUNTY_ESCROW_ABI } from '@/lib/wallet';

/**
 * Hook for direct contract interactions from frontend.
 * Currently only exposes claimPayment - all other operations go through backend API.
 */
export function useClaimPayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const claim = async (taskId: `0x${string}`) => {
    return writeContract({
      address: CONTRACTS.BOUNTY_ESCROW,
      abi: BOUNTY_ESCROW_ABI,
      functionName: 'claimPayment',
      args: [taskId],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    claim,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

/**
 * Read task escrow state directly from contract
 */
export function useTaskEscrow(taskId: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.BOUNTY_ESCROW,
    abi: BOUNTY_ESCROW_ABI,
    functionName: 'getTaskEscrow',
    args: taskId ? [taskId] : undefined,
    query: {
      enabled: !!taskId,
    },
  });
}

/**
 * Read contract ETH balance
 */
export function useContractBalance() {
  return useReadContract({
    address: CONTRACTS.BOUNTY_ESCROW,
    abi: BOUNTY_ESCROW_ABI,
    functionName: 'getContractBalance',
  });
}

/**
 * Lock escrow - typically called by backend, but exposed for admin/emergency use
 */
export function useLockEscrow() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const lock = async (taskId: `0x${string}`, rewardPerWorker: bigint, maxWorkers: number) => {
    const total = rewardPerWorker * BigInt(maxWorkers);
    return writeContract({
      address: CONTRACTS.BOUNTY_ESCROW,
      abi: BOUNTY_ESCROW_ABI,
      functionName: 'lockEscrow',
      args: [taskId, rewardPerWorker, maxWorkers],
      value: total,
    });
  };

  return {
    lock,
    hash,
    error,
    isPending,
  };
}

/**
 * Refund remaining - typically called by backend
 */
export function useRefundRemaining() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const refund = async (taskId: `0x${string}`) => {
    return writeContract({
      address: CONTRACTS.BOUNTY_ESCROW,
      abi: BOUNTY_ESCROW_ABI,
      functionName: 'refundRemaining',
      args: [taskId],
    });
  };

  return {
    refund,
    hash,
    error,
    isPending,
  };
}

/**
 * Release escrow - typically called by backend
 */
export function useReleaseEscrow() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const release = async (taskId: `0x${string}`, submissionId: `0x${string}`) => {
    return writeContract({
      address: CONTRACTS.BOUNTY_ESCROW,
      abi: BOUNTY_ESCROW_ABI,
      functionName: 'releaseEscrow',
      args: [taskId, submissionId],
    });
  };

  return {
    release,
    hash,
    error,
    isPending,
  };
}