import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import {
  LayoutDashboard,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Plus,
  Users,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { tasks, setIsCreateModalOpen, setActiveTab } = useAppStore();

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' || t.workersJoined >= t.workersRequired);
  const openTasks = tasks.filter((t) => t.status === 'OPEN');

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
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#836EF9] mb-2 flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" /> // Operational Analytics
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Task & Settlement <span className="text-white/70">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="liquid-glass rounded-full px-5 py-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border border-white/10"
            >
              <span>View Marketplace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="liquid-glass-strong rounded-full px-6 py-3 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 border border-white/20 shadow-xl shadow-[#836EF9]/10 group"
            >
              <Plus className="w-4 h-4 text-[#836EF9] group-hover:scale-110 transition-transform" />
              <span>Publish New Task</span>
            </button>
          </div>
        </motion.div>

        {/* Metric Cards Row (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="text-xs font-mono text-white/50 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-[#836EF9]" /> Total Tasks
              </span>
              <span className="text-[10px] font-mono text-[#836EF9] bg-[#836EF9]/10 px-2 py-0.5 rounded-full border border-[#836EF9]/20">
                Live Queue
              </span>
            </div>
            <div className="font-heading italic text-4xl sm:text-5xl text-white mb-2">{tasks.length}</div>
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% activity this week
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="text-xs font-mono text-white/50 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Swarm Tasks
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                100% Verified
              </span>
            </div>
            <div className="font-heading italic text-4xl sm:text-5xl text-white mb-2">{completedTasks.length + 14}</div>
            <div className="text-xs text-white/60 font-mono">Consensus accuracy rate</div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="text-xs font-mono text-white/50 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#836EF9]" /> Total Mon Paid
              </span>
              <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
            </div>
            <div className="font-heading italic text-4xl sm:text-5xl text-white mb-2">425.5 <span className="text-2xl text-white/60">MON</span></div>
            <div className="text-xs text-white/60 font-mono">Sub-second Monad finality</div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all hover:-translate-y-1"
          >
            <div className="text-xs font-mono text-white/50 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Active Workers
              </span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="font-heading italic text-4xl sm:text-5xl text-white mb-2">38,912</div>
            <div className="text-xs text-emerald-400 font-mono">Verified Node Status</div>
          </motion.div>
        </div>

        {/* Interactive Analytics Velocity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-10 backdrop-blur-xl bg-black/40"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h3 className="font-heading italic text-2xl text-white">Task Completion & Micro-Settlement Velocity</h3>
              <p className="text-xs text-white/50 font-mono">Daily tasks verified & MON token rewards released in real time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Monad Testnet • Live
              </span>
            </div>
          </div>

          {/* SVG Curve chart */}
          <div className="h-52 w-full relative pt-4">
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
        </motion.div>

        {/* Tasks Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl bg-black/40"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="font-heading italic text-2xl text-white">Active & Recent Swarm Tasks</h3>
            <span className="text-xs font-mono text-white/50">{tasks.length} Total Registered Tasks</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-mono text-white/50">
                  <th className="pb-4 font-normal">TASK TITLE</th>
                  <th className="pb-4 font-normal">CATEGORY</th>
                  <th className="pb-4 font-normal">REWARD</th>
                  <th className="pb-4 font-normal">WORKER NODES</th>
                  <th className="pb-4 font-normal">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 pr-4 text-white font-medium">{task.title}</td>
                    <td className="py-4 pr-4 text-white/60 font-mono">{task.category}</td>
                    <td className="py-4 pr-4 text-[#836EF9] font-bold font-mono">{task.reward}</td>
                    <td className="py-4 pr-4 text-white/60 font-mono">
                      {task.workersJoined}/{task.workersRequired}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase border ${
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
        </motion.div>
      </div>
    </div>
  );
};
