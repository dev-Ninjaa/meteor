import React, { useState, useEffect, useCallback } from 'react';
import { useMarketplace, useMarketplaceTags } from '@/hooks';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem, TaskCategory, VerificationType } from '../../types';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { ProgressIndicator } from '../../components/shared/ProgressIndicator';
import { AiSummaryCard } from '../../components/shared/AiSummaryCard';
import {
  Search,
  Filter,
  Zap,
  Users,
  Clock,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Brain,
  Zap as ZapIcon,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { CreateTaskModal } from '../../components/marketplace/CreateTaskModal';
import { InteractiveSolverModal } from '../../components/marketplace/InteractiveSolverModal';
import { TaskDetailModal } from '../../components/marketplace/TaskDetailModal';
import { ManualVerificationModal } from '../../components/marketplace/ManualVerificationModal';

export const MarketplaceView: React.FC = () => {
  const { data: tasksResponse, isLoading, error, refetch } = useMarketplace();
  const { data: tagsData } = useMarketplaceTags();
  const { selectedTask, isDetailModalOpen, isSolveModalOpen, isCreateModalOpen, setSelectedTask, setIsDetailModalOpen, setIsSolveModalOpen, setIsCreateModalOpen } = useAppStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'progress'>('newest');

  const tasks = tasksResponse?.data || [];
  const tags = tagsData?.data || [];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesVerification = selectedVerification === 'All' || task.verificationType === selectedVerification;
    return matchesSearch && matchesCategory && matchesVerification;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'reward') return parseFloat(b.reward) - parseFloat(a.reward);
    if (sortBy === 'progress') return (b.workersCompleted / b.workersRequired) - (a.workersCompleted / a.workersRequired);
    return 0;
  });

  const handleOpenSolve = useCallback(async (task: TaskItem) => {
    setSelectedTask(task);
    setIsSolveModalOpen(true);
  }, [setSelectedTask, setIsSolveModalOpen]);

  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const errorToastShown = React.useRef(false);
  useEffect(() => {
    if (error && !isLoading && !errorToastShown.current) {
      errorToastShown.current = true;
      toast('Failed to load marketplace - using cached data.', 'destructive');
    } else if (!error) {
      errorToastShown.current = false;
    }
  }, [error, isLoading]);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 flex items-center justify-center">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
        />
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#836EF9] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
        />
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          {error && !isLoading && tasks.length > 0 && (
            <div className="mb-6 p-4 liquid-glass rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-mono text-amber-300">Using cached data - some tasks may be outdated</span>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" />
                <span className="text-xs font-mono text-[#836EF9] uppercase font-semibold tracking-widest">
                  Swarm Marketplace
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 rounded-2xl bg-[#111113] border border-white/10 text-white text-sm hover:border-[#836EF9] hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-[#836EF9] text-white text-sm font-semibold hover:bg-[#836EF9]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#836EF9]/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
              </div>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Browse <span className="text-white/70">Active Tasks</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="liquid-glass rounded-3xl p-4 md:p-6 border border-white/10 mb-8 backdrop-blur-xl bg-black/40"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white placeholder-white/40 focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white text-sm focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all appearance-none bg-no-repeat bg-right pr-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
                >
                  <option value="All">All Categories</option>
                  {['Writing', 'Coding', 'Design', 'Research', 'Analysis', 'Review', 'Translation', 'Data'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="px-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white text-sm focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all appearance-none bg-no-repeat bg-right pr-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
                >
                  <option value="All">All Verification</option>
                  <option value="AI">AI Verification</option>
                  <option value="MANUAL">Human Review</option>
                  <option value="BOTH">Hybrid</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white text-sm focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all appearance-none bg-no-repeat bg-right pr-10"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundSize: '12px', backgroundPosition: 'right 12px center' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="reward">Highest Reward</option>
                  <option value="progress">Most Progress</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => handleTaskClick(task)}
                className="liquid-glass rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between backdrop-blur-xl bg-black/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {task.category}
                    </span>
                    <VerificationBadge type={task.verificationType as VerificationType} />
                  </div>
                  <h3 className="font-heading italic text-xl text-white group-hover:text-[#836EF9] transition-colors mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 mb-4 font-light">
                    {task.description}
                  </p>
                </div>
                <div className="space-y-3">
                  <ProgressIndicator joined={task.workersJoined} required={task.workersRequired} />
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
                      {task.reward} MON
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {task.workersJoined}/{task.workersRequired}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.duration || '10 mins'}
                    </span>
                    <span className="text-[#836EF9] flex items-center gap-1 group-hover:underline">
                      <span>View Details</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {sortedTasks.length === 0 && (
              <div className="col-span-full text-center py-20 text-white/40 font-mono text-xs">
                No active swarm tasks match your current filter parameters.
              </div>
            )}
          </motion.div>

          {/* AI Summary Cards for tasks with AI summaries */}
          {tasks
            .filter(task => task.aiSummary)
            .map((task, idx) => (
              <AiSummaryCard key={task.id} summary={task.aiSummary!} />
            ))}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal />
      <InteractiveSolverModal />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSolve={handleOpenSolve}
        onClaim={async (task) => {
          // Handle claim payout
          console.log('Claim payout for task:', task.id);
        }}
      />
      <ManualVerificationModal />
    </>
  );
};