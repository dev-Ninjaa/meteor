import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { ShieldCheck, Award, Zap, Star } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const skills = [
    'AI Red-Teaming',
    'Rust Async Debugging',
    'Japanese Localization',
    'California Contract Law',
    'Satellite Data Annotation',
    'Monad Smart Audit',
  ];

  const badges = [
    { title: 'Founding Swarm Node', icon: ShieldCheck, color: 'text-[#836EF9]' },
    { title: '100% Consensus Accuracy', icon: Award, color: 'text-emerald-400' },
    { title: 'Sub-Second Solver', icon: Zap, color: 'text-amber-400' },
    { title: 'AI Red-Teamer Level 3', icon: Star, color: 'text-indigo-400' },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video (full bleed) with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
      />

      {/* Heavy Dark Overlay & Blur */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-2 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Node Reputation Vector
          </div>
          <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            Swarm Node <span className="text-white/70">Profile</span>
          </h1>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="liquid-glass rounded-3xl p-8 border border-white/15 mb-8 relative overflow-hidden backdrop-blur-xl bg-black/40 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#836EF9] to-indigo-500 flex items-center justify-center text-black font-bold font-mono text-xl shadow-xl shadow-[#836EF9]/20 border-2 border-white">
              MN
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white font-mono">Swarm Worker Node</h2>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                  Verified Node
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 font-light">
                Programmable Human Intelligence Worker & AI Verification Specialist
              </p>

              <div className="flex items-center gap-6 mt-4 text-xs font-mono text-white/50">
                <div>
                  <span className="text-white font-bold">14</span> Tasks Solved
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">99.8%</span> Consensus Rate
                </div>
                <div>
                  <span className="text-[#836EF9] font-bold">425.5 MON</span> Earned
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges & Verified Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40"
          >
            <h3 className="font-heading italic text-2xl text-white mb-4">Protocol Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${b.color}`} />
                    <span className="text-xs font-medium text-white/90">{b.title}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Verified Skills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40"
          >
            <h3 className="font-heading italic text-2xl text-white mb-4">Verified Skill Vectors</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
