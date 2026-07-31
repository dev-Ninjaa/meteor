import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { CheckCircle2, Zap, ExternalLink, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { monBalance, transactions } = useAppStore();

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video (full bleed) with smooth crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      />

      {/* Dark Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-2 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Monad Settlement Engine
          </div>
          <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            Monad Wallet & <span className="text-white/70">Escrow Ledger</span>
          </h1>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="liquid-glass rounded-3xl p-8 border border-white/15 relative overflow-hidden mb-10 backdrop-blur-xl bg-gradient-to-br from-[#836EF9]/10 via-transparent to-transparent shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#836EF9]/20 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/70 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Monad Testnet (Chain ID 10143)</span>
              </div>

              <div className="text-xs font-mono text-white/40 mb-1">AVAILABLE BALANCE</div>
              <div className="font-heading italic text-5xl sm:text-7xl text-white font-normal leading-none mb-2">
                {monBalance.toFixed(2)}{' '}
                <span className="text-[#836EF9] text-3xl sm:text-4xl not-italic font-sans font-extrabold ml-1">
                  MON
                </span>
              </div>
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Instant Smart Contract Settlement Ready
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://explorer.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black font-semibold text-xs rounded-full px-6 py-3 hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95"
              >
                <span>View Monad Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Transactions Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl bg-black/40"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="font-heading italic text-2xl text-white">Sub-second Transaction Ledger</h3>
              <p className="text-xs text-white/50 font-mono">Instant task payouts & smart contract escrow releases</p>
            </div>
            <span className="text-xs font-mono text-[#836EF9] bg-[#836EF9]/10 px-3 py-1 rounded-full border border-[#836EF9]/20 font-semibold">
              Block finality: 0.42s
            </span>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      tx.amount.startsWith('+')
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{tx.type}</div>
                    <div className="text-[11px] font-mono text-white/40 flex items-center gap-1 mt-0.5">
                      <span>{tx.txHash}</span>
                      <span>•</span>
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-mono font-bold ${
                      tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
