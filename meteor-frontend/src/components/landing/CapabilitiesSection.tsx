import React from 'react';
import { motion } from 'framer-motion';
import { Globe, DollarSign, Brain } from 'lucide-react';

export const CapabilitiesSection: React.FC = () => {
  return (
    <section className="relative w-full bg-black overflow-hidden flex flex-col justify-start px-6 md:px-16 lg:px-20 py-20 md:py-24 border-t border-white/10">
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col justify-start">
        {/* Header */}
        <div className="max-w-4xl">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Core Thesis
          </div>
          <h2 className="font-heading italic text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.0] tracking-[-2px] text-left">
            The Internet Can Access Computers. but It Can't Access People.
          </h2>
        </div>

        {/* 3 Compact Friction Explanation Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="liquid-glass rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-[#836EF9] border border-white/10">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  Physical World
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  Human Eyes
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-heading italic text-white text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight mb-2">
                The Physical Gap
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                Computers can call APIs, but they can't visit a store, inspect real-world locations, or verify real-life events. AI needs human eyes on the ground.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="liquid-glass rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-emerald-400 border border-white/10">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  High Fees
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  Slow Payouts
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-heading italic text-white text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight mb-2">
                Payment Friction
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                Traditional banks can't send $0.10 for a 30-second task without massive fees and delays. Instant micro-settlements are required to hire people on-demand.
              </p>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-2xl p-5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-indigo-400 border border-white/10">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  Human Nuance
                </span>
                <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/90 font-mono">
                  AI Edge Cases
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-heading italic text-white text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight mb-2">
                Nuance & Judgment
              </h3>
              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                AI models hallucinate and fail at edge cases. They lack human intuition, cultural context, and subjective reasoning needed to verify accurate truth.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
