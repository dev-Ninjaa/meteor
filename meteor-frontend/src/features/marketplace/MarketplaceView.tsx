import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem } from '../../data/mockData';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { ProgressIndicator } from '../../components/shared/ProgressIndicator';
import { Search, Plus, Clock, Zap, ArrowUpRight, Filter } from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubmissionType,
    setSelectedSubmissionType,
    selectedVerificationType,
    setSelectedVerificationType,
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

  const submissionTypes = [
    { label: 'All Submissions', value: 'All' },
    { label: 'Text', value: 'text' },
    { label: 'Multiple Choice', value: 'multiple_choice' },
    { label: 'Rating', value: 'rating' },
    { label: 'Image', value: 'image' },
    { label: 'GPS / Location', value: 'gps' },
    { label: 'Screen Recording', value: 'screen_recording' },
  ];

  const verificationTypes = [
    { label: 'All Pipelines', value: 'All' },
    { label: 'AI Verification', value: 'AI Verification' },
    { label: 'Human Review', value: 'Human Review' },
    { label: 'AI First', value: 'AI First' },
    { label: 'Consensus', value: 'Consensus' },
    { label: 'Hybrid', value: 'Hybrid' },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSubmission = selectedSubmissionType === 'All' || t.submissionType === selectedSubmissionType;
    const matchesVerification = selectedVerificationType === 'All' || t.verificationType === selectedVerificationType;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubmission && matchesVerification && matchesSearch;
  });

  const handleOpenSolve = (task: TaskItem) => {
    setSelectedTask(task);
    setIsSolveModalOpen(true);
  };

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
        {/* Top Header & Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-[#836EF9] uppercase font-semibold tracking-widest">
                Real-Time Task Exchange
              </span>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Swarm Intelligence <span className="text-white/70">Marketplace</span>
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="liquid-glass rounded-full px-6 py-3.5 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center gap-2 shadow-2xl border border-white/20 self-start md:self-auto group"
          >
            <Plus className="w-4 h-4 text-[#836EF9] group-hover:scale-110 transition-transform" />
            <span>Publish Task (AI Prompt)</span>
          </button>
        </motion.div>

        {/* Filter Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-4 mb-10"
        >
          {/* Search Bar & Dropdown Selects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by prompt, category, verification type..."
                className="w-full liquid-glass border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#836EF9] transition-all backdrop-blur-xl"
              />
            </div>

            {/* Submission Type Dropdown */}
            <div>
              <select
                value={selectedSubmissionType}
                onChange={(e) => setSelectedSubmissionType(e.target.value)}
                className="w-full liquid-glass border border-white/10 rounded-2xl px-4 py-3 text-xs text-white bg-black focus:outline-none focus:border-[#836EF9]"
              >
                {submissionTypes.map((st) => (
                  <option key={st.value} value={st.value} className="bg-black text-white">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Pipeline Dropdown */}
            <div>
              <select
                value={selectedVerificationType}
                onChange={(e) => setSelectedVerificationType(e.target.value)}
                className="w-full liquid-glass border border-white/10 rounded-2xl px-4 py-3 text-xs text-white bg-black focus:outline-none focus:border-[#836EF9]"
              >
                {verificationTypes.map((vt) => (
                  <option key={vt.value} value={vt.value} className="bg-black text-white">
                    {vt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Filter className="w-3.5 h-3.5 text-white/40 shrink-0" />
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

        {/* Dense Information Task Grid */}
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
                {/* Card Header Tags */}
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                      {task.category}
                    </span>
                    <VerificationBadge type={task.verificationType} />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-[#836EF9] font-bold bg-[#836EF9]/10 px-3 py-1 rounded-full border border-[#836EF9]/20">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{task.reward}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="font-heading italic text-xl text-white group-hover:text-[#836EF9] transition-colors mb-2 line-clamp-2 leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-3 mb-4">
                  {task.description}
                </p>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                <ProgressIndicator
                  joined={task.workersJoined}
                  required={task.workersRequired}
                />

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{task.duration}</span>
                  </div>

                  <span className="text-[10px] text-white/40 uppercase">
                    Type: {task.submissionType}
                  </span>
                </div>

                {/* Accept Action Button */}
                <button
                  onClick={() => handleOpenSolve(task)}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 group-hover:border-white/30 shadow-lg"
                >
                  <span>Accept & Submit Task</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 text-white/40 font-mono text-xs">
            No active swarm tasks match your current filter parameters.
          </div>
        )}
      </div>
    </div>
  );
};
