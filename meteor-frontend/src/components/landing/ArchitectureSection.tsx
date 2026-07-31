import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { Cpu, Users, ShieldCheck, Zap, Database, ArrowRight } from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
            Section 08 // Technical Architecture
          </div>
          <BlurText
            text="Decentralized Protocol Layering"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-xl mx-auto">
            Combining off-chain AI red-teaming with sub-second Monad EVM execution.
          </p>
        </div>

        {/* SVG Architecture Diagram Box */}
        <div className="liquid-glass rounded-3xl p-8 border border-white/10 relative overflow-hidden bg-black/60">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center text-center">
            {/* Box 1: AI Agent */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl bg-[#111113] border border-white/15 flex flex-col items-center gap-3 relative"
            >
              <div className="w-12 h-12 rounded-xl bg-[#836EF9]/20 text-[#836EF9] flex items-center justify-center border border-[#836EF9]/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">1. AI Agent / REST API</div>
              <div className="text-xs text-white/50 font-mono">Dispatches Prompt</div>
            </motion.div>

            {/* Connector */}
            <div className="hidden lg:flex justify-center text-white/30">
              <ArrowRight className="w-6 h-6 text-[#836EF9] animate-pulse" />
            </div>

            {/* Box 2: Meteor Router */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl liquid-glass-strong border border-[#836EF9]/40 flex flex-col items-center gap-3 relative"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                <Database className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">2. Meteor Task Router</div>
              <div className="text-xs text-white/50 font-mono">Decomposes & Escrows</div>
            </motion.div>

            {/* Connector */}
            <div className="hidden lg:flex justify-center text-white/30">
              <ArrowRight className="w-6 h-6 text-[#836EF9] animate-pulse" />
            </div>

            {/* Box 3: Human Swarm */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl bg-[#111113] border border-white/15 flex flex-col items-center gap-3 relative"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">3. Global Human Swarm</div>
              <div className="text-xs text-white/50 font-mono">Executes Microtask</div>
            </motion.div>
          </div>

          {/* Bottom Settlement Row */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-[#836EF9] shrink-0" />
              <div className="text-left">
                <div className="text-xs font-mono uppercase text-[#836EF9] font-bold">Consensus Verification</div>
                <div className="text-xs text-white/70 mt-0.5">
                  Dual AI validation and multi-worker consensus ensure zero spam or hallucinated submissions.
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
              <Zap className="w-8 h-8 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-mono uppercase text-amber-400 font-bold">Monad Blockchain Engine</div>
                <div className="text-xs text-white/70 mt-0.5">
                  10,000 TPS with sub-second finality allows micro-payments down to 0.1 MON per task seamlessly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
