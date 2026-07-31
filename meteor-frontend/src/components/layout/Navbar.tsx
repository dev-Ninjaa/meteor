import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { GithubIcon } from '../shared/GithubIcon';
import { Globe, ArrowUpRight, LayoutDashboard, Store, Wallet, ArrowLeft } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

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

        {/* Center: Landing Section links or App Navigation */}
        {activeTab === 'landing' ? (
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#thesis"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Thesis
            </a>
            <a
              href="#vision"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Vision
            </a>
            <a
              href="#how-it-works"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#why-now"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Why Now
            </a>
            <a
              href="#use-cases"
              className="text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Use Cases
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-1 liquid-glass rounded-full px-2 py-1 bg-black/40 border border-white/10 backdrop-blur-2xl">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-white text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'wallet'
                  ? 'bg-white text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>
          </div>
        )}

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

          {/* Landing page CTA */}
          {activeTab === 'landing' && (
            <button
              onClick={() => setActiveTab('marketplace')}
              className="bg-white hover:bg-white/90 text-black font-semibold text-xs rounded-full px-4 py-2 flex items-center gap-1 shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <span>Try MVP</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* App Page Action: Back to Landing */}
          {activeTab !== 'landing' && (
            <button
              onClick={() => setActiveTab('landing')}
              className="liquid-glass rounded-full px-3.5 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
