import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { GithubIcon } from '../shared/GithubIcon';
import { useAppStore } from '../../store/useAppStore';
import { Star, ArrowUpRight, Globe, Shield, Terminal } from 'lucide-react';

export const OpenSourceSection: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <footer className="relative py-28 px-6 bg-black border-t border-white/10 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Call To Action Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="liquid-glass-strong rounded-3xl p-8 sm:p-12 border border-white/20 text-center relative overflow-hidden mb-20 bg-gradient-to-b from-white/5 to-transparent"
        >
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#836EF9]/15 blur-3xl pointer-events-none" />

          <span className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-4 inline-block font-semibold">
            Monad Ecosystem Hackathon MVP
          </span>

          <BlurText
            text="Ready to experience the future of work?"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight justify-center max-w-2xl mx-auto mb-4"
          />

          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto mb-8 font-light">
            Try the marketplace, publish tasks via AI prompt, or verify microtasks and earn instant MON payouts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="bg-white text-black font-semibold text-sm rounded-full px-8 py-4 flex items-center gap-2 shadow-2xl hover:bg-white/90 transition-all hover:scale-105"
            >
              <span>Try MVP Marketplace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass rounded-full px-8 py-4 text-sm font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/15"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Star on GitHub (1.4k)</span>
            </a>
          </div>
        </motion.div>

        {/* Footer Navigation & Open Source Meta */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 border-t border-white/10 text-xs text-white/60">
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
