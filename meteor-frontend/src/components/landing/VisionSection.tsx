import React from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { Network, Bot, Building2, Cloud, Code2 } from 'lucide-react';

export const VisionSection: React.FC = () => {
  const visions = [
    {
      title: 'Human API',
      desc: 'Query human perception, creativity, and localized knowledge through a standardized REST & GraphQL endpoint.',
      icon: Network,
    },
    {
      title: 'Agent Economy',
      desc: 'Autonomous AI agents hiring humans to solve captchas, verify real-world facts, and audit high-stakes decisions.',
      icon: Bot,
    },
    {
      title: 'Autonomous Organizations',
      desc: 'DAOs operating at machine speed with instant micro-contract execution and zero administrative overhead.',
      icon: Building2,
    },
    {
      title: 'Human Compute Cloud',
      desc: 'Elastic scaling of human intelligence nodes available 24/7 across every timezone and language globally.',
      icon: Cloud,
    },
    {
      title: 'Programmable Work',
      desc: 'Replacing rigid 9-to-5 employment contracts with granular, liquid micro-contributions settled in real-time.',
      icon: Code2,
    },
  ];

  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-3">
            Section 09 // Long Term Vision
          </div>
          <BlurText
            text="The Future of Autonomous Work"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-4 max-w-xl mx-auto">
            Building the foundation where software and human intellect merge into a seamless global computing grid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visions.map((v, idx) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`p-6 rounded-3xl liquid-glass border border-white/10 flex flex-col justify-between hover:border-[#836EF9]/40 transition-all ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#836EF9] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading italic text-3xl text-white mb-2">{v.title}</h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">{v.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-white/40">
                  // METEOR_PROTOCOL_MODULE_{idx + 1}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
