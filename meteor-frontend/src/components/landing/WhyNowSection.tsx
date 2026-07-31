import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

const EXISTING_PLATFORM_POINTS = [
  'Built for projects',
  'One freelancer',
  'Days to complete',
  'Manual coordination',
  'Delayed payments',
];

const OUR_PLATFORM_POINTS = [
  'Built for microtasks',
  'Human + AI agents',
  'Minutes to complete',
  'AI orchestration',
  'Instant settlement',
];

export const WhyNowSection: React.FC = () => {
  return (
    <section id="why-now" className="relative py-28 px-6 md:px-16 lg:px-20 bg-black overflow-hidden border-t border-white/10">
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
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Why Now
          </div>
          <h2 className="font-heading italic text-white text-4xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight">
            A New Marketplace for <br className="hidden sm:inline" />
            <span className="text-white/80">Human Intelligence</span>
          </h2>
        </motion.div>

        {/* 3-Column Feature Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Existing Platforms */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-4">
                Legacy Stack
              </span>
              <h3 className="font-heading italic text-white/70 text-2xl mb-6 tracking-tight">
                Existing Platforms
              </h3>

              <ul className="space-y-3">
                {EXISTING_PLATFORM_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-xs sm:text-sm text-white/50 font-light">
                    <XCircle className="w-4 h-4 text-white/30 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Column 2: Our Platform */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="liquid-glass rounded-2xl p-6 border border-[#836EF9]/40 bg-gradient-to-b from-[#836EF9]/10 via-transparent to-transparent flex flex-col justify-between shadow-xl shadow-[#836EF9]/5"
          >
            <div>
              <span className="text-xs font-mono text-[#836EF9] uppercase tracking-wider block mb-4 font-semibold">
                Meteor Protocol
              </span>
              <h3 className="font-heading italic text-white text-2xl mb-6 tracking-tight">
                Our Platform
              </h3>

              <ul className="space-y-3">
                {OUR_PLATFORM_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-xs sm:text-sm text-white font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#836EF9] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Column 3: The Opportunity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-4">
                The Paradigm
              </span>
              <h3 className="font-heading italic text-white text-2xl mb-4 tracking-tight">
                The Opportunity
              </h3>

              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                Millions of tasks don't need a freelancer—they need five minutes of human intelligence. As AI adoption grows, demand for human judgment, creativity, and verification grows with it. We're building the infrastructure for that future.
              </p>
            </div>

            {/* Highlighted Glass Quote */}
            <div className="liquid-glass rounded-xl p-4 border border-white/15 bg-white/5 relative overflow-hidden">
              <p className="font-heading italic text-white text-sm sm:text-base leading-snug">
                "The future won't hire people. It will request intelligence."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
