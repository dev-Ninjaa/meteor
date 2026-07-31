import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { Brain, Palette, Scale, Sparkles } from 'lucide-react';

export const BigIdeaSection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
            Section 03 // The Vision
          </div>
          <BlurText
            text="What if humans became programmable?"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-xl mx-auto">
            Instead of hiring individuals for months, software applications can call human compute functions just like cloud APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Human Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="liquid-glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between hover:border-[#836EF9]/50 transition-all hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#836EF9] mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-heading italic text-3xl text-white mb-3">Human Intelligence</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                Extract physical-world facts, verify local news, and gather real-time data that no web scraper can access.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
              <span>GET /api/v1/human/verify</span>
              <Sparkles className="w-3.5 h-3.5 text-[#836EF9]" />
            </div>
          </motion.div>

          {/* Card 2: Human Creativity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="liquid-glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between hover:border-[#836EF9]/50 transition-all hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-heading italic text-3xl text-white mb-3">Human Creativity</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                Inject emotional resonance, cultural humor, and authentic artistic feedback into synthetic media.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
              <span>POST /api/v1/human/refine</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </motion.div>

          {/* Card 3: Human Judgment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between hover:border-[#836EF9]/50 transition-all hover:-translate-y-1 group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-heading italic text-3xl text-white mb-3">Human Judgment</h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                Provide critical ethical safety checks, legal risk scoring, and zero-hallucination validation before deployment.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
              <span>POST /api/v1/human/audit</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
