import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MapPin, Cpu } from 'lucide-react';
import { FadingVideo } from '../shared/FadingVideo';

const HIGHLIGHT_CARDS = [
  {
    icon: Brain,
    title: 'Human Judgment',
    desc: "When AI isn't confident, humans make the final decision.",
    color: 'text-[#836EF9]',
  },
  {
    icon: Sparkles,
    title: 'Human Creativity',
    desc: 'Inject emotional resonance, cultural humor, and authentic taste.',
    color: 'text-amber-400',
  },
  {
    icon: MapPin,
    title: 'Local Intelligence',
    desc: 'Verify physical-world facts and real-life events on the ground.',
    color: 'text-emerald-400',
  },
  {
    icon: Cpu,
    title: 'AI + Human Collaboration',
    desc: 'AI dispatches microtasks to a global swarm in real time.',
    color: 'text-indigo-400',
  },
];

export const VisionSection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 md:px-16 lg:px-20 bg-black overflow-hidden border-t border-white/10">
      {/* Background Video with smooth crossfade matching website theme */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
      />

      {/* Dark Gradient Overlay for high-contrast text and liquid-glass cards */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black z-0 pointer-events-none" />

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
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Vision
          </div>
          <h2 className="font-heading italic text-white text-4xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight mb-8">
            The Future of Work Isn't Jobs. <br className="hidden sm:inline" />
            <span className="text-white/80">It's Tasks.</span>
          </h2>

          <div className="space-y-4 text-white/70 text-base md:text-lg font-light leading-relaxed max-w-3xl">
            <p>
              AI is automating execution, but humans remain irreplaceable for judgment, creativity, local knowledge, trust, and real-world verification.
            </p>
            <p>
              We're building the missing layer between AI and people—a marketplace where humans and AI agents collaborate through programmable microtasks.
            </p>
            <p className="text-white font-normal">
              Instead of hiring someone for hours, you request seconds of intelligence.
            </p>
          </div>
        </motion.div>

        {/* Bottom Highlight (4 Horizontal Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HIGHLIGHT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 backdrop-blur-xl"
              >
                <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mb-6 border border-white/10">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <h3 className="font-heading italic text-white text-2xl tracking-tight leading-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    {card.desc}
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
