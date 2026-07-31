import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Eye, Bot, Rocket, Palette, Globe2 } from 'lucide-react';
import { FadingVideo } from '../shared/FadingVideo';

const ASK_CARDS = [
  {
    icon: MapPin,
    badge: 'Local Intelligence',
    subtitle: 'Need someone at a specific place?',
    color: 'text-[#836EF9]',
    items: [
      'Is this café actually open?',
      'Check if this product is in stock.',
      'Take a photo of Times Square right now.',
    ],
  },
  {
    icon: Eye,
    badge: 'Human Judgment',
    subtitle: 'When AI needs a second opinion.',
    color: 'text-amber-400',
    items: [
      'Which logo looks better?',
      'Would you trust this website?',
      'Which resume would you shortlist?',
    ],
  },
  {
    icon: Bot,
    badge: 'AI Needs Humans',
    subtitle: 'Help AI where confidence is low.',
    color: 'text-indigo-400',
    items: [
      'Verify an AI-generated answer.',
      'Find hallucinations.',
      'Review AI-written code.',
    ],
  },
  {
    icon: Rocket,
    badge: 'Build Better Products',
    subtitle: 'Real users. Real feedback.',
    color: 'text-emerald-400',
    items: [
      'Find bugs in my website.',
      'Test my checkout flow.',
      'Record your screen using my app.',
    ],
  },
  {
    icon: Palette,
    badge: 'Creative Work',
    subtitle: 'Creativity still belongs to humans.',
    color: 'text-pink-400',
    items: [
      'Give my startup a better name.',
      'Rewrite this headline.',
      'Suggest a better app icon.',
    ],
  },
  {
    icon: Globe2,
    badge: 'Real-World Verification',
    subtitle: "Information AI can't see.",
    color: 'text-cyan-400',
    items: [
      'Is this road closed?',
      'Is this ATM working?',
      'Verify this restaurant exists.',
    ],
  },
];

export const WhatCanYouAskSection: React.FC = () => {
  return (
    <section className="relative py-28 px-6 md:px-16 lg:px-20 bg-black overflow-hidden border-t border-white/10">
      {/* Background Video with smooth crossfade matching website theme */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
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
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // What Can You Ask?
          </div>
          <h2 className="font-heading italic text-white text-4xl sm:text-6xl md:text-7xl leading-[1.0] tracking-tight mb-6">
            Anything Can Become a Task.
          </h2>
          <p className="text-white/70 text-base md:text-lg font-light leading-relaxed max-w-3xl">
            From real-world verification to creative feedback, if it needs human judgment, local knowledge, or creativity, simply publish a task and let the swarm handle the rest.
          </p>
        </motion.div>

        {/* Responsive Card Grid (6 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {ASK_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.badge}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="liquid-glass rounded-2xl p-6 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 backdrop-blur-xl"
              >
                <div>
                  {/* Header Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-white tracking-tight">
                      {card.badge}
                    </span>
                    <div className="w-8 h-8 rounded-lg liquid-glass flex items-center justify-center border border-white/10">
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>

                  <p className="text-xs text-white/50 font-mono mb-5">
                    {card.subtitle}
                  </p>

                  {/* Task Items list */}
                  <ul className="space-y-2.5">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs text-white/80 font-light">
                        <span className="text-[#836EF9] mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Highlighted Glass Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="liquid-glass rounded-2xl p-8 border border-white/15 max-w-3xl mx-auto text-center relative overflow-hidden backdrop-blur-xl bg-white/[0.02]"
        >
          <p className="font-heading italic text-white text-xl sm:text-2xl md:text-3xl leading-snug tracking-tight">
            "If it takes less than 15 minutes, it shouldn't require hiring a freelancer. It should be a task."
          </p>
        </motion.div>
      </div>
    </section>
  );
};
