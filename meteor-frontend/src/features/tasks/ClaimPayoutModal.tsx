import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWriteBountyEscrowClaimPayment } from '@/lib/generated';
import { useAppStore } from '../../store/useAppStore';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/hooks/useToast';
import { getGasLimit } from '@/lib/utils';
import { TaskItem } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

interface ClaimPayoutModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClaimPayoutModal: React.FC<ClaimPayoutModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !task) return null;

  const { address, connector, chain } = useAccount();
  const { writeContractAsync: claimOnContract } = useWriteBountyEscrowClaimPayment();
  const { claimPayment } = usePayments();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleClaim = async () => {
    if (!address || !connector) {
      toast('Connect your wallet to claim payment', 'destructive');
      return;
    }
    if (chain?.id !== 10143) {
      toast('Please switch to Monad Testnet (Chain ID: 10143)', 'destructive');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    try {
      const { keccak256, toHex } = await import('viem');
      const taskIdBytes32 = keccak256(toHex(task.id));
      const txHash = await claimOnContract({
        args: [taskIdBytes32 as `0x${string}`],
        gas: getGasLimit('CLAIM_PAYMENT'),
      });

      await claimPayment.mutateAsync({ taskId: task.id, txHash });

      toast('Payment claimed successfully!', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Claim payment failed:', err);
      if (err?.name === 'UnauthorizedProviderError' || 
          err?.message?.includes('not been authorized') ||
          err?.message?.includes('User rejected')) {
        setClaimError('Wallet connection required. Please reconnect and try again.');
      } else if (err?.message?.includes('Already claimed') || err?.message?.includes('Not eligible')) {
        setClaimError('Payment already claimed or not eligible');
      } else {
        setClaimError(err?.response?.data?.message ?? err?.shortMessage ?? 'Failed to claim payment. Please try again.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Claim Payout
                </span>
              </div>
              <button
                onClick={onClose}
                disabled={isClaiming}
                className="text-white/40 hover:text-white transition-colors p-1 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Task Info */}
              <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                <h3 className="font-heading italic text-lg text-white mb-2">{task.title}</h3>
                <p className="text-xs text-white/60 line-clamp-2">{task.description}</p>
              </div>

              {/* Reward Amount */}
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Reward per Worker</div>
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                  <span className="font-heading italic text-4xl font-bold text-emerald-300">{task.reward}</span>
                  <span className="font-mono text-xl text-emerald-400 self-end mb-2">MON</span>
                </div>
                <p className="text-xs text-emerald-400/70 mt-2">Available to claim now</p>
              </div>

              {/* Status / Error */}
              {claimError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs">{claimError}</p>
                </div>
              )}

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={isClaiming || !address || !connector || chain?.id !== 10143}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-semibold hover:bg-emerald-500/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Claim Payout ({task.reward} MON)</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              {(!address || !connector) && (
                <p className="text-xs text-white/40 text-center">Connect wallet to claim</p>
              )}
              {chain?.id !== 10143 && address && (
                <p className="text-xs text-amber-400 text-center">Switch to Monad Testnet (Chain ID: 10143)</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ClaimPayoutModal;