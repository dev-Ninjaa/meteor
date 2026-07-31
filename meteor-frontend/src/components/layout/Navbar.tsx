import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { GithubIcon } from '../shared/GithubIcon';
import { Globe, ArrowUpRight, Wallet, LayoutDashboard, Store } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, isConnected, monBalance, connectWallet } = useAppStore();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav className="liquid-glass rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between pointer-events-auto backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Left: Logo */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#836EF9] to-white flex items-center justify-center text-black font-bold shadow-lg shadow-[#836EF9]/20 group-hover:scale-105 transition-transform">
            <Globe className="w-4 h-4 text-black animate-spin-slow" />
          </div>
          <span className="font-heading italic text-2xl text-white tracking-tight font-semibold">
            Meteor
          </span>
        </button>

        {/* Center: Nav links (Pill style) */}
        <div className="hidden md:flex items-center gap-1 liquid-glass rounded-full px-2 py-1 bg-black/40 border border-white/5">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'landing'
                ? 'bg-white/15 text-white shadow-inner font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'marketplace'
                ? 'bg-white/15 text-white shadow-inner font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#836EF9]" />
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white/15 text-white shadow-inner font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'wallet'
                ? 'bg-white/15 text-white shadow-inner font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Wallet
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* GitHub button */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* Wallet / Try MVP CTA */}
          {isConnected ? (
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#836EF9] font-bold">{monBalance.toFixed(1)} MON</span>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-[#836EF9]" />
              Connect Wallet
            </button>
          )}

          {/* Primary Action Button */}
          {activeTab === 'landing' && (
            <button
              onClick={() => setActiveTab('marketplace')}
              className="bg-white hover:bg-white/90 text-black font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1 shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <span>Try MVP</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
