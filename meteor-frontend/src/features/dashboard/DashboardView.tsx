import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckCircle2, DollarSign, Clock, ShieldCheck, TrendingUp, Cpu, Plus } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { tasks, setIsCreateModalOpen } = useAppStore();

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' || t.workersJoined >= t.workersRequired);
  const openTasks = tasks.filter((t) => t.status === 'OPEN');

  return (
    <div className="min-h-screen bg-[#09090B] text-white pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-mono uppercase text-[#836EF9] mb-1 font-semibold">
            Operational Analytics
          </div>
          <h1 className="font-heading italic text-4xl sm:text-5xl text-white tracking-tight">
            Task & Settlement Dashboard
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="liquid-glass-strong rounded-full px-6 py-3 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/20"
        >
          <Plus className="w-4 h-4 text-[#836EF9]" />
          <span>Publish New Task</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="liquid-glass rounded-3xl p-6 border border-white/10">
          <div className="text-xs font-mono text-white/50 mb-2 flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4 text-[#836EF9]" /> Total Tasks Created
          </div>
          <div className="font-heading italic text-4xl text-white">{tasks.length}</div>
          <div className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% this week
          </div>
        </div>

        <div className="liquid-glass rounded-3xl p-6 border border-white/10">
          <div className="text-xs font-mono text-white/50 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Swarm Tasks
          </div>
          <div className="font-heading italic text-4xl text-white">{completedTasks.length + 14}</div>
          <div className="text-xs text-white/60 mt-2 font-mono">100% consensus accuracy</div>
        </div>

        <div className="liquid-glass rounded-3xl p-6 border border-white/10">
          <div className="text-xs font-mono text-white/50 mb-2 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#836EF9]" /> Total Mon Paid Out
          </div>
          <div className="font-heading italic text-4xl text-white">425.5 MON</div>
          <div className="text-xs text-white/60 mt-2 font-mono">Sub-second finality</div>
        </div>

        <div className="liquid-glass rounded-3xl p-6 border border-white/10">
          <div className="text-xs font-mono text-white/50 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Worker Reputation
          </div>
          <div className="font-heading italic text-4xl text-white">99.8%</div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Verified Node Status</div>
        </div>
      </div>

      {/* Interactive Analytics SVG Chart */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8 bg-[#111113]/80">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Task Completion & Micro-Settlement Velocity</h3>
            <p className="text-xs text-white/50">Daily tasks verified & MON token rewards released</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Monad Testnet
          </span>
        </div>

        {/* SVG Curve chart */}
        <div className="h-48 w-full relative pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#836EF9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#836EF9" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 120 Q 75 90, 150 100 T 300 40 T 450 20 L 500 15 L 500 150 L 0 150 Z"
              fill="url(#chartGlow)"
            />
            <path
              d="M 0 120 Q 75 90, 150 100 T 300 40 T 450 20 L 500 15"
              fill="none"
              stroke="#836EF9"
              strokeWidth="3"
            />
            <circle cx="300" cy="40" r="5" fill="#836EF9" className="animate-ping" />
            <circle cx="300" cy="40" r="4" fill="#FFFFFF" />
            <circle cx="450" cy="20" r="4" fill="#FFFFFF" />
          </svg>
        </div>

        <div className="flex justify-between text-xs font-mono text-white/40 mt-4 border-t border-white/5 pt-4">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="liquid-glass rounded-3xl p-6 border border-white/10 bg-[#111113]/80">
        <h3 className="text-base font-semibold text-white mb-4">Active & Recent Tasks</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono text-white/50">
                <th className="pb-3 font-normal">TASK TITLE</th>
                <th className="pb-3 font-normal">CATEGORY</th>
                <th className="pb-3 font-normal">REWARD</th>
                <th className="pb-3 font-normal">WORKERS</th>
                <th className="pb-3 font-normal">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-4 text-white font-medium">{task.title}</td>
                  <td className="py-3.5 pr-4 text-white/60 font-mono">{task.category}</td>
                  <td className="py-3.5 pr-4 text-[#836EF9] font-bold font-mono">{task.reward}</td>
                  <td className="py-3.5 pr-4 text-white/60 font-mono">
                    {task.workersJoined}/{task.workersRequired}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase border ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#836EF9]/10 text-[#836EF9] border-[#836EF9]/20'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
