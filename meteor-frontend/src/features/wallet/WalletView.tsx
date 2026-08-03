import React from 'react';
import { usePayments } from '@/hooks';
import { useAccount, useBalance } from 'wagmi';
import { monadTestnet } from '@/lib/chains';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { formatEther } from 'viem';
import { useRef } from 'react';

export const WalletView: React.FC = () => {
  const { transactions, isLoading: txLoading, totalEarnings, totalSpending, pendingRewards, claimPayment } = usePayments();
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: balance } = useBalance({ address: wagmiAddress, chainId: monadTestnet.id });
  const { toast } = useToast();

  const pendingRewardsDisplay = pendingRewards?.toFixed(1) || '0.0';
    const monBalance = balance ? parseFloat(formatEther(balance.value)).toFixed(2) : '0.00';

    // Show toast on error but don't block UI - only show once per error
    const errorToastShown = useRef(false);
    React.useEffect(() => {
      // The usePayments hook would need to expose error state
      // For now we rely on the query's internal error handling
    }, []);

    return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video (full bleed) with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
      />

      {/* Heavy Dark Overlay & Blur */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-[#836EF9] uppercase font-semibold tracking-widest">
                Monad Testnet Settlement Ledger
              </span>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Swarm Worker <span className="text-white/70">Wallet</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && wagmiAddress ? (
              <div className="liquid-glass rounded-full px-4 py-2 text-xs font-mono text-white/90 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{wagmiAddress.slice(0, 6)}...{wagmiAddress.slice(-4)}</span>
              </div>
            ) : (
              <div className="liquid-glass rounded-full px-4 py-2 text-xs font-mono text-white/70 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20" />
                <span>Wallet not connected</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Balance Overview Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="liquid-glass rounded-3xl p-6 border border-white/15 bg-black/40 backdrop-blur-xl"
          >
            <div className="text-xs font-mono text-white/50 mb-1">Available Balance</div>
            <div className="text-3xl font-mono font-bold text-white">{monBalance} MON</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Sub-Second Monad RPC
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="liquid-glass rounded-3xl p-6 border border-white/15 bg-black/40 backdrop-blur-xl"
          >
            <div className="text-xs font-mono text-white/50 mb-1">Total Earned</div>
            <div className="text-3xl font-mono font-bold text-[#836EF9]">+{totalEarnings} MON</div>
            <div className="text-[10px] font-mono text-white/40 mt-2">Verified Task Solves</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-6 border border-white/15 bg-black/40 backdrop-blur-xl"
          >
            <div className="text-xs font-mono text-white/50 mb-1">Total Spent</div>
            <div className="text-3xl font-mono font-bold text-amber-400">-{totalSpending} MON</div>
            <div className="text-[10px] font-mono text-white/40 mt-2">Task Escrow Locks</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="liquid-glass rounded-3xl p-6 border border-white/15 bg-black/40 backdrop-blur-xl"
          >
            <div className="text-xs font-mono text-white/50 mb-1">Pending Escrow</div>
            <div className="text-3xl font-mono font-bold text-indigo-400">+{pendingRewardsDisplay} MON</div>
            <div className="text-[10px] font-mono text-indigo-400 mt-2">Awaiting Consensus</div>
          </motion.div>
        </div>

        {/* Detailed On-Chain Activity Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="liquid-glass rounded-3xl p-8 border border-white/15 bg-black/40 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading italic text-2xl text-white">Recent Task Activity & Rewards</h3>
            <span className="text-xs font-mono text-white/50">On-Chain Activity</span>
          </div>

          <div className="space-y-4">
            {txLoading && transactions.length === 0 ? (
              <div className="text-center py-8 text-white/50 font-mono text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#836EF9] border-t-transparent mx-auto mb-2" />
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-white/40 font-mono text-xs">
                No on-chain activity yet. Complete tasks to see rewards here.
              </div>
            ) : (
              transactions.map((tx: any) => {
                const isPositive = tx.amount.startsWith('+') || !tx.amount.startsWith('-');
                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white">{tx.taskTitle}</div>
                        <div className="text-[10px] font-mono text-white/50 flex items-center gap-2 mt-0.5">
                          <span>{tx.type}</span>
                          <span>•</span>
                          <span>{tx.timestamp}</span>
                          <span>•</span>
                          <span className="text-[#836EF9] hover:underline flex items-center gap-0.5">
                            {tx.txHash} <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`font-mono text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {tx.amount}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};