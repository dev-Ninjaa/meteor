import React from 'react';
import { USE_CASES } from '../../data/mockData';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { useAppStore } from '../../store/useAppStore';
import { ArrowUpRight, Zap, Clock, Shield } from 'lucide-react';

export const UseCasesSection: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
              Section 04 // Microtask Workflows
            </div>
            <BlurText
              text="Microtask primitives for every domain."
              className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight text-left"
            />
          </div>
          <button
            onClick={() => setActiveTab('marketplace')}
            className="liquid-glass rounded-full px-6 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors flex items-center gap-2 self-start md:self-auto border border-white/10"
          >
            <span>Explore All Marketplace Tasks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-[#836EF9]/40 transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">
                    {uc.category}
                  </span>
                  <span className="text-xs font-mono text-[#836EF9] flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3" /> {uc.rewardAvg}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#836EF9] transition-colors mb-2">
                  {uc.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-light">{uc.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-400" /> Avg speed: {uc.speed}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#836EF9]" /> AI Verified
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
