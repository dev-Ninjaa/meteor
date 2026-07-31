import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Star, Globe, Shield, Terminal } from 'lucide-react';

export const OpenSourceSection: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <footer className="relative py-16 px-6 bg-black border-t border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Footer Navigation & Open Source Meta */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-white/60">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#836EF9]" />
              <span className="font-heading italic text-xl text-white">Meteor</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Programmable Human Intelligence marketplace built for sub-second settlement on Monad EVM.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-white text-xs uppercase mb-3 tracking-wider font-semibold">Protocol</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-white transition-colors">
                  Marketplace App
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">
                  Task Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('wallet')} className="hover:text-white transition-colors">
                  Monad Wallet
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-white text-xs uppercase mb-3 tracking-wider font-semibold">Open Source</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" /> GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-[#836EF9]" /> REST & Graph API Specs
                </a>
              </li>
              <li>
                <a href="https://explorer.monad.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Monad Contract Audit
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2 font-mono">
            <div className="text-white text-xs font-semibold">MONAD TESTNET</div>
            <div className="text-white/40 text-[11px]">Chain ID: 10143</div>
            <div className="text-white/40 text-[11px]">Block Finality: ~0.42s</div>
            <div className="text-emerald-400 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-white/30 text-[11px] font-mono">
          © 2026 Meteor Protocol Inc. Built for Monad Ecosystem. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
