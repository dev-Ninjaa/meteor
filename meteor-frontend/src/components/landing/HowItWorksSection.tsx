import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { MessageSquareCode, Cpu, Users, Zap, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Describe Task',
      desc: 'Type naturally in plain English or submit via REST API. No complex task specification required.',
      icon: MessageSquareCode,
      tag: 'ChatGPT Style Input',
    },
    {
      num: '02',
      title: 'AI Decomposes & Escrows',
      desc: 'Meteor AI engine breaks down requirements, assigns worker count, and locks MON reward in smart contract.',
      icon: Cpu,
      tag: 'Monad Contract Lock',
    },
    {
      num: '03',
      title: 'Global Swarm Executes',
      desc: 'Qualified human workers receive instant notifications and submit proofs of work.',
      icon: Users,
      tag: 'Real-time Human Nodes',
    },
    {
      num: '04',
      title: 'Instant Settlement',
      desc: 'Automated AI audit verifies consensus proof and releases funds in 0.42 seconds.',
      icon: Zap,
      tag: 'Sub-second Monad Payout',
    },
  ];

  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
            Section 06 // Architecture & Workflow
          </div>
          <BlurText
            text="How Programmable Work Functions"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-xl mx-auto">
            From natural prompt to sub-second blockchain settlement in 4 automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-[#836EF9]/20 via-[#836EF9]/50 to-[#836EF9]/20 z-0 pointer-events-none" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="liquid-glass rounded-3xl p-6 border border-white/10 relative z-10 flex flex-col justify-between hover:border-[#836EF9]/40 transition-all hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-black border border-white/15 flex items-center justify-center text-[#836EF9] group-hover:scale-110 transition-transform shadow-lg shadow-[#836EF9]/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-white/40">{s.num}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-light">{s.desc}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-[#836EF9]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s.tag}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
