import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Wallet, ArrowUpRight, CheckCircle2, Copy, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

export const WalletView: React.FC = () => {
  const { walletAddress, monBalance, transactions, addToast } = useAppStore();

  const copyAddress = () => {
    navigator.clipboard.writeText('0x71C829a174092bF88A319B41');
    addToast('Address Copied', 'Wallet address copied to clipboard', 'info');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase text-[#836EF9] mb-1 font-semibold">
          On-Chain Settlement Layer
        </div>
        <h1 className="font-heading italic text-4xl sm:text-5xl text-white tracking-tight">
          Monad Wallet & Escrow Ledger
        </h1>
      </div>

      {/* Main Balance Card */}
      <div className="liquid-glass-strong rounded-3xl p-8 border border-white/20 relative overflow-hidden mb-8 bg-gradient-to-br from-[#836EF9]/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#836EF9]/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Monad Testnet (Chain ID 10143)</span>
            </div>

            <div className="text-xs font-mono text-white/40 mb-1">AVAILABLE BALANCE</div>
            <div className="font-heading italic text-5xl sm:text-6xl text-white font-bold">
              {monBalance.toFixed(2)}{' '}
              <span className="text-[#836EF9] text-3xl sm:text-4xl not-italic font-sans font-extrabold">
                MON
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 liquid-glass rounded-2xl px-4 py-2 border border-white/10 text-xs font-mono">
              <span className="text-white/70">{walletAddress}</span>
              <button onClick={copyAddress} className="text-white/40 hover:text-white transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <a
              href="https://explorer.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-semibold text-xs rounded-full px-6 py-2.5 hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>View Monad Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 bg-[#111113]/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Sub-second Transaction Ledger</h3>
            <p className="text-xs text-white/50">Instant task rewards and smart contract escrow releases</p>
          </div>
          <span className="text-xs font-mono text-[#836EF9]">Block finality: 0.42s</span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-4"
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
      </div>
    </div>
  );
};
