import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { ArrowRight, Clock, AlertCircle, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
            Section 02 // The Problem
          </div>
          <BlurText
            text="The Internet Can Access Computers. It Can't Access People."
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-xl mx-auto">
            Traditional freelancing platforms were designed for 2008 jobs, not high-velocity AI agent workflows.
          </p>
        </div>

        {/* Comparison Cards: Today vs Tomorrow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Today Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-[#111113] border border-white/10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-white">Today (Legacy Platforms)</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Fiverr / Upwork
              </span>
            </div>

            <div className="space-y-3">
              {[
                'Need quick feedback or verification',
                'Search directory for freelancers',
                'Wait 24-48 hours for bids & replies',
                'Negotiate price, scope, and milestones',
                'Manual review & dispute resolution',
                '20% platform fee & 14-day payout hold',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono flex items-center justify-center font-bold">
                    0{idx + 1}
                  </div>
                  <span className="text-xs text-white/70">{step}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tomorrow Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl liquid-glass border border-[#836EF9]/40 relative overflow-hidden bg-gradient-to-br from-[#836EF9]/5 to-transparent"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#836EF9]/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#836EF9]" />
                <h3 className="text-lg font-semibold text-white">Tomorrow (Meteor Engine)</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#836EF9]/20 text-[#836EF9] border border-[#836EF9]/30">
                Programmable Monad
              </span>
            </div>

            <div className="space-y-3">
              {[
                'Need human judgment or verification',
                'Publish microtask via natural prompt or API',
                'AI Engine routes instantly to qualified global swarm',
                'Completed in under 3 minutes with 99.8% consensus',
                'Automated AI audit verifies output proof',
                'Instant payout settled on Monad in <0.42 seconds',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-[#836EF9]/20 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#836EF9] text-black text-xs font-mono flex items-center justify-center font-bold">
                    0{idx + 1}
                  </div>
                  <span className="text-xs text-white font-medium">{step}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
