import React from 'react';
import { FadingVideo } from '../shared/FadingVideo';
import { BlurText } from '../shared/BlurText';
import { GithubIcon } from '../shared/GithubIcon';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap, CheckCircle2, ShieldCheck, Cpu, Clock, Globe } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab } = useAppStore();

  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-between text-center pt-24 pb-12 px-6">
      {/* Background Video with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center translate-y-[17%] z-0 pointer-events-none opacity-80"
      />

      {/* Subtle Gradient vignette overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black z-0 pointer-events-none" />

      {/* Hero Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto mt-4 mb-auto py-4">
        {/* Hero Heading with Instrument Serif */}
        <div className="mb-6">
          <BlurText
            text="Human Intelligence. On Demand."
            className="text-5xl sm:text-7xl lg:text-8xl font-heading italic text-white leading-[0.9] tracking-[-3px] max-w-4xl"
            delay={0.2}
          />
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg text-white/80 max-w-2xl font-light leading-relaxed mb-8 px-4"
        >
          The fastest way for people and AI agents to collaborate through instant, AI-verified microtasks settled on Monad.
        </motion.p>

        {/* Two CTAs: Try MVP & GitHub (per specification update) */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveTab('marketplace')}
            className="liquid-glass-strong rounded-full px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 shadow-2xl group border border-white/20"
          >
            <Zap className="w-4 h-4 text-[#836EF9] group-hover:scale-110 transition-transform" />
            <span>Try MVP</span>
            <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-full px-6 py-3.5 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
          >
            <GithubIcon className="w-4 h-4" />
            <span>View Source code</span>
          </a>
        </motion.div>

        {/* Live Interactive Task Flow Strip */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="w-full max-w-3xl liquid-glass rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-left backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#836EF9]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-white/50 uppercase">Task Engine</div>
              <div className="text-xs font-medium text-white">AI Decomposes Prompt</div>
            </div>
          </div>

          <div className="text-white/20 text-xs hidden sm:block">→</div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-white/50 uppercase">Global Swarm</div>
              <div className="text-xs font-medium text-white">Human Worker Solves</div>
            </div>
          </div>

          <div className="text-white/20 text-xs hidden sm:block">→</div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#836EF9]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-white/50 uppercase">Settlement</div>
              <div className="text-xs font-medium text-white">Instant Monad Payout</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="relative z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto pt-4"
      >
        <div className="liquid-glass rounded-2xl p-4 text-left border border-white/10">
          <div className="text-white/50 text-xs font-mono mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#836EF9]" /> Avg Settlement
          </div>
          <div className="font-heading italic text-3xl text-white">0.42s</div>
          <div className="text-[11px] text-white/60 mt-1">Sub-second Monad finality</div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 text-left border border-white/10">
          <div className="text-white/50 text-xs font-mono mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Active Workers
          </div>
          <div className="font-heading italic text-3xl text-white">38,912</div>
          <div className="text-[11px] text-white/60 mt-1">Verified human nodes</div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 text-left border border-white/10">
          <div className="text-white/50 text-xs font-mono mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> AI Agents Connected
          </div>
          <div className="font-heading italic text-3xl text-white">12,450</div>
          <div className="text-[11px] text-white/60 mt-1">Autonomously dispatching</div>
        </div>

        <div className="liquid-glass rounded-2xl p-4 text-left border border-white/10">
          <div className="text-white/50 text-xs font-mono mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#836EF9]" /> Verification Rate
          </div>
          <div className="font-heading italic text-3xl text-white">99.8%</div>
          <div className="text-[11px] text-white/60 mt-1">Consensus accuracy</div>
        </div>
      </motion.div>
    </section>
  );
};
