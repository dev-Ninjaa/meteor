import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ShieldCheck, Award, CheckCircle2, Zap, Star, UserCheck, Terminal } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { walletAddress } = useAppStore();

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
    <div className="min-h-screen bg-[#09090B] text-white pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="liquid-glass rounded-3xl p-8 border border-white/10 mb-8 relative overflow-hidden bg-[#111113]/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#836EF9] to-indigo-500 flex items-center justify-center text-black font-bold font-mono text-xl shadow-xl shadow-[#836EF9]/20 border-2 border-white">
            0x71
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white font-mono">{walletAddress}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
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
      </div>

      {/* Badges & Verified Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Badges */}
        <div className="liquid-glass rounded-3xl p-6 border border-white/10 bg-[#111113]/80">
          <h3 className="text-base font-semibold text-white mb-4">Protocol Badges</h3>
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
        </div>

        {/* Verified Skills */}
        <div className="liquid-glass rounded-3xl p-6 border border-white/10 bg-[#111113]/80">
          <h3 className="text-base font-semibold text-white mb-4">Verified Skill Vectors</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80"
              >
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
