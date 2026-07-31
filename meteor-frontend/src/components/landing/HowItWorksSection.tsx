import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Users, Zap } from 'lucide-react';

const TIMELINE_STEPS = [
  {
    step: '01',
    title: 'Describe a task',
    desc: 'Prompt your requirement or send an API request.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'AI breaks it into microtasks',
    desc: 'Decomposes complex requests into 30-sec primitives.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Humans & AI agents complete it',
    desc: 'Dispatched to global worker nodes and AI checkers.',
    icon: Users,
  },
  {
    step: '04',
    title: 'Monad settles instantly',
    desc: 'Sub-second smart contract escrow & payouts.',
    icon: Zap,
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-28 px-6 md:px-16 lg:px-20 bg-black overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Label & Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mb-16"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-4 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // How It Works
          </div>
          <h2 className="font-heading italic text-white text-4xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight">
            Publish Once. <br className="hidden sm:inline" />
            <span className="text-white/80">A Swarm Takes Care of the Rest.</span>
          </h2>
        </motion.div>

        {/* 4-Step Horizontal Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {TIMELINE_STEPS.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <motion.div
                key={stepItem.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all relative group"
              >
                {/* Step indicator top header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-[#836EF9] font-semibold tracking-wider">
                    {stepItem.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl liquid-glass flex items-center justify-center border border-white/10 text-white/80 group-hover:text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-heading italic text-white text-xl sm:text-2xl mb-2 tracking-tight leading-snug">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
