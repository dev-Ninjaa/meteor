import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import {
  ShieldCheck,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  GitCommit,
  Flame,
  UserCheck,
  Award as Trophy
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { walletAddress, monBalance } = useAppStore();

  const achievements = [
    { title: 'Top Tester', category: 'Quality', icon: Trophy, color: 'text-amber-400' },
    { title: 'Bug Hunter', category: 'Code Debugging', icon: Zap, color: 'text-[#836EF9]' },
    { title: 'Translator', category: 'Localization', icon: Star, color: 'text-indigo-400' },
    { title: 'Fast Responder', category: 'Sub-Second', icon: Clock, color: 'text-emerald-400' },
    { title: 'Verified Expert', category: 'AI Red-Teaming', icon: ShieldCheck, color: 'text-cyan-400' },
  ];

  const skills = [
    'AI Red-Teaming & Hallucination Audit',
    'Rust Async Mutex Locks',
    'Japanese Localization & Idioms',
    'California Civil Code § 1668 Compliance',
    'Satellite Thermal Imagery Annotation',
    'Monad Smart Contract Audit',
  ];

  const activityGrid = Array.from({ length: 48 }, (_, i) => ({
    count: Math.floor(Math.random() * 5),
    day: i,
  }));

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
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="liquid-glass rounded-3xl p-8 border border-white/15 mb-8 relative overflow-hidden backdrop-blur-xl bg-black/40 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#836EF9] to-indigo-500 flex items-center justify-center text-black font-bold font-mono text-xl shadow-xl border-2 border-white">
              MN
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-mono">{walletAddress}</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                  Verified Expert Node
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 font-light">
                Programmable Human Intelligence Worker & AI Verification Specialist
              </p>

              {/* GitHub-style key metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10 text-xs font-mono">
                <div>
                  <div className="text-white/40">Completion Rate</div>
                  <div className="text-lg font-bold text-emerald-400">99.8%</div>
                </div>
                <div>
                  <div className="text-white/40">Verification Accuracy</div>
                  <div className="text-lg font-bold text-[#836EF9]">100%</div>
                </div>
                <div>
                  <div className="text-white/40">Tasks Solved</div>
                  <div className="text-lg font-bold text-white">48 Solved</div>
                </div>
                <div>
                  <div className="text-white/40">Avg Response Time</div>
                  <div className="text-lg font-bold text-indigo-400">1.8 mins</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GitHub-Style Contribution / Verification Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 border border-white/15 mb-8 backdrop-blur-xl bg-black/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading italic text-2xl text-white flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-[#836EF9]" /> Verification Activity Heatmap
            </h3>
            <span className="text-xs font-mono text-white/50">48 verifications in last 30 days</span>
          </div>

          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 pt-2">
            {activityGrid.map((item, idx) => (
              <div
                key={idx}
                title={`${item.count} verifications on Day ${item.day + 1}`}
                className={`h-4 rounded-md transition-all ${
                  item.count === 0
                    ? 'bg-white/5'
                    : item.count === 1
                    ? 'bg-[#836EF9]/30'
                    : item.count === 2
                    ? 'bg-[#836EF9]/60'
                    : 'bg-[#836EF9] shadow-lg shadow-[#836EF9]/40'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Achievements & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Natural Earned Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40"
          >
            <h3 className="font-heading italic text-2xl text-white mb-4">Earned Protocol Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${a.color}`} />
                    <div>
                      <div className="text-xs font-semibold text-white">{a.title}</div>
                      <div className="text-[10px] font-mono text-white/40">{a.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Verified Skill Vectors */}
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
                  className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-white/80"
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
