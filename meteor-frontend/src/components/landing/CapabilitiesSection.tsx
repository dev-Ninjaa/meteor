import React from 'react';
import { FadingVideo } from '../shared/FadingVideo';
import { BlurText } from '../shared/BlurText';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Sparkles, CheckCircle2, Layers, Zap } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col justify-between px-6 md:px-16 lg:px-20 pt-28 pb-16">
      {/* Background Video (full bleed) with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black z-0 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-between min-h-[85vh]">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#836EF9]" /> // Capabilities & Protocol
          </div>
          <BlurText
            text="Programmable Human Intelligence. Evolved."
            className="font-heading italic text-white text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-[-3px] text-left"
            delay={0.2}
          />
        </div>

        {/* 3 Capabilities Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="liquid-glass rounded-[1.25rem] p-6 flex flex-col justify-between border border-white/10 min-h-[340px] hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center text-[#836EF9] border border-white/10">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Natural Context
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Zero Hallucination
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Instant Scale
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-tight leading-none mb-3">
                AI Red-Teaming & Verification
              </h3>
              <p className="text-xs md:text-sm text-white/80 font-light leading-relaxed">
                Human-in-the-loop validation for edge cases, legal clauses, localized imagery, and nuance that AI models cannot resolve autonomously.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="liquid-glass rounded-[1.25rem] p-6 flex flex-col justify-between border border-white/10 min-h-[340px] hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center text-emerald-400 border border-white/10">
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Sub-second
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Monad Escrow
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Zero Fees
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-tight leading-none mb-3">
                Instant Micro-Settlements
              </h3>
              <p className="text-xs md:text-sm text-white/80 font-light leading-relaxed">
                Every task payout executes in under 0.42 seconds on Monad testnet. No minimum withdrawals, no payout waiting periods.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-[1.25rem] p-6 flex flex-col justify-between border border-white/10 min-h-[340px] hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center text-indigo-400 border border-white/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Consensus Proof
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[11px] text-white/90 font-mono">
                  Automated Audit
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-tight leading-none mb-3">
                Dual AI & Human Consensus
              </h3>
              <p className="text-xs md:text-sm text-white/80 font-light leading-relaxed">
                Tasks require multi-worker quorum or automated AI verification before smart contracts release micro-payments automatically.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
