import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem } from '../../data/mockData';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { Search, Plus, Clock, Users, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setIsCreateModalOpen,
    setSelectedTask,
    setIsSolveModalOpen,
  } = useAppStore();

  const categories = [
    'All',
    'AI Verification',
    'Code Debugging',
    'Translation',
    'Local Knowledge',
    'Design Feedback',
    'Data Labeling',
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenSolve = (task: TaskItem) => {
    setSelectedTask(task);
    setIsSolveModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video (full bleed) with smooth crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
      />

      {/* Dark Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Header & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-[#836EF9] uppercase font-semibold tracking-widest">
                Live Monad Swarm Grid
              </span>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Human Intelligence <span className="text-white/70">Marketplace</span>
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="liquid-glass-strong rounded-full px-6 py-3.5 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 shadow-2xl border border-white/20 self-start md:self-auto group"
          >
            <Plus className="w-4 h-4 text-[#836EF9] group-hover:scale-110 transition-transform" />
            <span>Publish Microtask (AI)</span>
          </button>
        </motion.div>

        {/* Search & Category Filter Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10"
        >
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by prompt, code, category..."
              className="w-full liquid-glass border border-white/10 rounded-full pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#836EF9] transition-all backdrop-blur-xl"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black font-semibold shadow-lg scale-105'
                    : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="liquid-glass rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden backdrop-blur-xl bg-black/40"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">
                    {task.category}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-mono text-[#836EF9] font-bold bg-[#836EF9]/10 px-3 py-1 rounded-full border border-[#836EF9]/20">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{task.reward}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-heading italic text-xl text-white group-hover:text-[#836EF9] transition-colors mb-2 line-clamp-2 leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-3 mb-6">
                  {task.description}
                </p>
              </div>

              <div>
                {/* Stats Bar */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{task.duration}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {task.workersJoined}/{task.workersRequired} Workers
                    </span>
                  </div>

                  {task.aiVerified && (
                    <div className="flex items-center gap-1 text-emerald-400" title="AI Verified Task">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px]">AI Audit</span>
                    </div>
                  )}
                </div>

                {/* Accept Task Action Button */}
                <button
                  onClick={() => handleOpenSolve(task)}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 group-hover:border-white/30 shadow-lg"
                >
                  <span>Accept & Solve Task</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 text-white/40 font-mono text-xs">
            No tasks found matching your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
