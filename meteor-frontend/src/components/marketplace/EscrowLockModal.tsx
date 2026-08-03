import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { parseEther, keccak256, toHex } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { bountyEscrowAbi, bountyEscrowAddress } from '@/lib/generated';
import { usePayments } from '@/hooks/usePayments';
import { useAppStore } from '../../store/useAppStore';
import { ModalWrapper } from '../ui/ModalWrapper';

interface EscrowLockModalProps {
  data: {
    taskId: string;
    rewardPerWorker: string;
    maxWorkers: number;
    totalAmount: string;
    escrowContractAddress: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EscrowLockModal({ data, isOpen, onClose }: EscrowLockModalProps) {
  const { address } = useAccount();
  const { writeContractAsync: writeLockEscrow } = useWriteContract();
  const { createEscrow } = usePayments();
  const { setIsLockingEscrow } = useAppStore();
  const [isLocking, setIsLocking] = useState(false);

  // Convert UUID to bytes32 for contract
  const taskIdBytes32 = data ? keccak256(toHex(data.taskId)) : '0x';

  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Lock Escrow" subtitle="Sign transaction to fund the escrow on Monad">
          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-mono text-white/50">Reward per Worker:</span> <span className="font-mono text-emerald-400">{data.rewardPerWorker} MON</span></div>
                <div><span className="font-mono text-white/50">Workers:</span> <span className="font-mono text-white">{data.maxWorkers}</span></div>
                <div className="col-span-2"><span className="font-mono text-white/50">Total to Lock:</span> <span className="font-mono text-xl text-emerald-400">{data.totalAmount} MON</span></div>
                <div className="col-span-2"><span className="font-mono text-white/50">Contract:</span> <span className="font-mono text-white/70 truncate">{data.escrowContractAddress}</span></div>
              </div>
            </div>

            <div className="text-xs text-white/50 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="font-mono text-amber-400 mb-2">⚡ Action Required</p>
              <p>Connect your wallet and sign the transaction to lock {data.totalAmount} MON in the escrow contract. This funds the rewards for all {data.maxWorkers} workers.</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={async () => {
                  if (!data || !address) return;
                  console.log('Lock escrow clicked, address:', address, 'data:', data);

                  setIsLocking(true);
                  try {
                    const rewardPerWorkerWei = parseEther(data.rewardPerWorker);
                    const maxWorkersBigInt = BigInt(data.maxWorkers);
                    const valueWei = parseEther(data.totalAmount);
                    console.log('Sending lockEscrow tx:', { taskIdBytes32, rewardPerWorkerWei, maxWorkersBigInt, valueWei });

                    const txHash = await writeLockEscrow({
                      abi: bountyEscrowAbi,
                      address: bountyEscrowAddress[10143] as `0x${string}`,
                      functionName: 'lockEscrow',
                      args: [taskIdBytes32, rewardPerWorkerWei, maxWorkersBigInt],
                      value: valueWei,
                    });

                    console.log("Escrow locked txHash:", txHash);

                    await createEscrow.mutateAsync({
                      taskId: data.taskId,
                      txHash,
                    });

                    onClose();
                  } catch (err) {
                    console.error("Failed to lock escrow:", err);
                    alert(`Failed to lock escrow: ${err instanceof Error ? err.message : "Unknown error"}`);
                  } finally {
                    setIsLocking(false);
                  }
                }}
                disabled={isLocking || createEscrow.isPending || !address}
                className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-2xl hover:bg-emerald-500/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                <span>{isLocking ? 'Locking...' : `Lock Escrow Now (${data?.totalAmount} MON)`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </AnimatePresence>
  );
}