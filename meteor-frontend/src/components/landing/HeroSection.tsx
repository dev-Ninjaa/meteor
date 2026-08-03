import React from 'react';
import { FadingVideo } from '../shared/FadingVideo';
import { BlurText } from '../shared/BlurText';
import { GithubIcon } from '../shared/GithubIcon';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { ArrowUpRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const { setActiveTab } = useAppStore();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-start text-center pt-32 sm:pt-36 pb-12 px-6">
      {/* Background Video with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        className="absolute inset-0 w-full h-full object-cover object-center translate-y-[17%] z-0 pointer-events-none opacity-80"
      />

      {/* Subtle Gradient vignette overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black z-0 pointer-events-none" />

      {/* Hero Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-start max-w-5xl mx-auto py-2">
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
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate('/app/marketplace')}
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
      </div>
    </section>
  );
};