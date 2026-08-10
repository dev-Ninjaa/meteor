import React, { useState, useEffect } from 'react';
import { useMarketplace, useMarketplaceTags } from '@/hooks';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem } from '../../types';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { AiSummaryCard } from '../../components/shared/AiSummaryCard';
import {
  AlertCircle,
  RefreshCw,
  Plus,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useSocket } from '@/hooks/useSocket';
import { TaskCard } from './TaskCard';
import { MarketplaceFilters } from './MarketplaceFilters';

export const MarketplaceView: React.FC = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const { data: tasksResponse, isLoading, error, refetch } = useMarketplace({ showCompleted });
  const { data: tagsData } = useMarketplaceTags();
  const { setSelectedTask, setIsDetailModalOpen, setIsCreateModalOpen } = useAppStore();
  const { toast } = useToast();
  const socket = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'progress'>('newest');

  // Re-fetch when showCompleted changes
  useEffect(() => {
    refetch();
  }, [showCompleted, refetch]);

  useEffect(() => {
    const unsubscribes = ['task.created', 'task.published', 'task.cancelled'].map((event) =>
      socket.on(event as 'task.created', () => refetch()),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [socket, refetch]);

  const tasks = tasksResponse?.data || [];
  const tags = tagsData?.data || [];
  void tags;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesVerification = selectedVerification === 'All' || task.verificationMode === selectedVerification;
    return matchesSearch && matchesCategory && matchesVerification;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'reward') return parseFloat(b.reward) - parseFloat(a.reward);
    if (sortBy === 'progress') return (b.workersCompleted / b.workersRequired) - (a.workersCompleted / a.workersRequired);
    return 0;
  });

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
                {/* Show Completed Toggle */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#111113] border border-white/10">
                  <span className="text-xs font-mono text-white/60">Show Completed</span>
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`relative w-12 h-6 rounded-full transition-all flex items-center p-1 ${
                      showCompleted
                        ? 'bg-[#836EF9] shadow-lg shadow-[#836EF9]/30'
                        : 'bg-white/10'
                    }`}
                    aria-label={showCompleted ? 'Hide completed tasks' : 'Show completed tasks'}
                  >
                    <motion.div
                      initial={{ x: showCompleted ? 22 : 2 }}
                      animate={{ x: showCompleted ? 22 : 2 }}
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                    >
                      {showCompleted ? <ToggleLeft className="w-4 h-4 text-[#836EF9]" /> : <ToggleRight className="w-4 h-4 text-white/60" />}
                    </motion.div>
                  </button>
                </div>
              </div>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              Browse <span className="text-white/70">Active Tasks</span>
            </h1>
          </motion.div>

          <MarketplaceFilters
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedVerification={selectedVerification}
            onVerificationChange={setSelectedVerification}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedTasks.map((task, idx) => (
              <TaskCard key={task.id} task={task} index={idx} onClick={handleTaskClick} />
            ))}

            {sortedTasks.length === 0 && (
              <div className="col-span-full text-center py-20 text-white/40 font-mono text-xs">
                No active tasks match your current filter parameters.
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
    </>
  );
};
