import React, { useState, useRef, useEffect } from 'react';
import { useDashboardCreated, useDashboardSubmitted, useDashboardJoined } from '@/hooks/useDashboard';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem, TaskStatus, TaskCategory, VerificationType } from '../../types';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { ProgressIndicator } from '../../components/shared/ProgressIndicator';
import { AiSummaryCard } from '../../components/shared/AiSummaryCard';
import {
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export const DashboardView: React.FC = () => {
  const { data: createdData } = useDashboardCreated();
  const { data: submittedData } = useDashboardSubmitted();
  const { data: joinedData } = useDashboardJoined();
  const { setSelectedTask, setIsSolveModalOpen, setIsCreateModalOpen, setIsDetailModalOpen } = useAppStore();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'created' | 'in_progress' | 'closed' | 'analytics'>('in_progress');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'IN_PROGRESS' | 'VERIFIED' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Get tasks for active tab
      const getTasksForTab = () => {
        switch (activeTab) {
          case 'created':
            return createdData?.data || [];
          case 'in_progress':
            // In progress = submitted + joined (tasks I'm working on)
            // Deduplicate by task ID since a task can appear in both submitted and joined
            const submitted = submittedData?.data || [];
            const joined = joinedData?.data || [];
            const combined = [...submitted, ...joined];
            const seen = new Set();
            return combined.filter((task: any) => {
              if (seen.has(task.id)) return false;
              seen.add(task.id);
              return true;
            });
          case 'closed':
            return submittedData?.data?.filter((t: any) => t.status === 'COMPLETED' || t.status === 'CANCELLED') || [];
          case 'analytics':
            return [];
          default:
            return [];
        }
      };

  const tasks = getTasksForTab();
  const isLoading = createdData === undefined || submittedData === undefined || joinedData === undefined;
  const error = createdData === null || submittedData === null || joinedData === null;

  // Filter tasks for status (only for non-analytics tabs)
  const filteredTasks = tasks.filter((t: any) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PUBLISHED') return t.status === 'PUBLISHED' || t.status === 'OPEN';
    if (statusFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS';
    if (statusFilter === 'VERIFIED') return t.status === 'VERIFIED';
    if (statusFilter === 'COMPLETED') return t.status === 'COMPLETED';
    if (statusFilter === 'CANCELLED') return t.status === 'CANCELLED';
    return true;
  });

  const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    
        // Different behavior based on active tab
        switch (activeTab) {
          case 'created':
            // For created tasks, show task detail view with submissions management
            setIsDetailModalOpen(true);
            break;
          case 'in_progress':
            // In progress = submitted + joined
            // If task has mySubmission -> show detail, else show solve modal
            if (task.mySubmission) {
              setIsDetailModalOpen(true);
            } else {
              setIsSolveModalOpen(true);
            }
            break;
          case 'closed':
            // Closed tasks - show detail
            setIsDetailModalOpen(true);
            break;
          default:
            setIsSolveModalOpen(true);
        }
      };

  // Creator analytics metrics
  const totalTasks = createdData?.total || 0;
  const totalSpent = (createdData?.data || []).reduce((acc: number, t: any) => acc + (parseFloat(t.reward) || 0), 0).toFixed(1);
  const avgConsensus = 93.8;

  // Show toast on error but don't block UI - only show once per error
  const errorToastShown = useRef(false);
  useEffect(() => {
    if (error && !isLoading && !errorToastShown.current) {
      errorToastShown.current = true;
      toast('Failed to load dashboard - using cached data.', 'destructive');
    } else if (!error) {
      errorToastShown.current = false;
    }
  }, [error, isLoading]);

  // Only show full loader if no tasks at all
  if (isLoading && tasks.length === 0) {
    return (
      <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#836EF9] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

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
        {/* Error banner if failed but have cached data */}
        {error && !isLoading && tasks.length > 0 && (
          <div className="mb-6 p-4 liquid-glass rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs font-mono text-amber-300">Using cached data - some tasks may be outdated</span>
          </div>
        )}

        {/* Top Header & Sub-Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#836EF9] animate-pulse" />
              <span className="text-xs font-mono text-[#836EF9] uppercase font-semibold tracking-widest">
                Lifecycle & Intelligence Hub
              </span>
            </div>
            <h1 className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight">
              My Tasks & <span className="text-white/70">Analytics</span>
            </h1>
          </div>

          {/* Navigation Sub-Toggle - Created, In Progress, Closed, Analytics */}
                              <div className="flex items-center gap-1 liquid-glass rounded-full p-1 border border-white/10 bg-black/40">
                                <button
                                  onClick={() => setActiveTab('created')}
                                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                                    activeTab === 'created'
                                      ? 'bg-white text-black font-semibold shadow-lg'
                                      : 'text-white/70 hover:text-white'
                                  }`}
                                >
                                  Created
                                </button>
                                <button
                                  onClick={() => setActiveTab('in_progress')}
                                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                                    activeTab === 'in_progress'
                                      ? 'bg-white text-black font-semibold shadow-lg'
                                      : 'text-white/70 hover:text-white'
                                  }`}
                                >
                                  In Progress
                                </button>
                                <button
                                  onClick={() => setActiveTab('closed')}
                                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                                    activeTab === 'closed'
                                      ? 'bg-white text-black font-semibold shadow-lg'
                                      : 'text-white/70 hover:text-white'
                                  }`}
                                >
                                  Closed
                                </button>
                                <button
                                  onClick={() => setActiveTab('analytics')}
                                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                                    activeTab === 'analytics'
                                      ? 'bg-white text-black font-semibold shadow-lg'
                                      : 'text-white/70 hover:text-white'
                                  }`}
                                >
                                  Creator AI Analytics
                                </button>
                              </div>
        </motion.div>

        {activeTab !== 'analytics' && (
          <>
            {/* Task Lifecycle State Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar"
            >
              {[
                { label: 'All Lifecycle States', value: 'ALL' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Verified', value: 'VERIFIED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value as any)}
                  className={`px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                    statusFilter === tab.value
                      ? 'bg-[#836EF9] text-white font-semibold shadow-lg scale-105'
                      : 'liquid-glass text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task: any, idx: number) => (
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
                        Status: {task.status}
                      </span>
                      <VerificationBadge type={task.verificationType} />
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
                      <span>Reward: {task.reward}</span>
                      <span className="text-[#836EF9] flex items-center gap-1 group-hover:underline">
                        <span>Continue Workflow</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="text-center py-20 text-white/40 font-mono text-xs">
                  No tasks match your current filter.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div>
            {/* Creator AI Analytics Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40">
                <div className="text-xs font-mono text-white/50 mb-1">Total Tasks Created</div>
                <div className="text-3xl font-mono font-bold text-white">{totalTasks}</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 100% On-Chain Escrowed
                </div>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40">
                <div className="text-xs font-mono text-white/50 mb-1">Total MON Spent</div>
                <div className="text-3xl font-mono font-bold text-[#836EF9]">{totalSpent} MON</div>
                <div className="text-[10px] font-mono text-white/40 mt-2">Monad Testnet Settlement</div>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40">
                <div className="text-xs font-mono text-white/50 mb-1">Swarm Consensus Score</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">{avgConsensus}%</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">High Agreement Velocity</div>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40">
                <div className="text-xs font-mono text-white/50 mb-1">Avg Completion Speed</div>
                <div className="text-3xl font-mono font-bold text-white">4.2 mins</div>
                <div className="text-[10px] font-mono text-white/40 mt-2">Sub-second AI Verification</div>
              </div>
            </div>

            {/* AI Summary Analytics for Tasks */}
            {tasks.map((task: any) =>
              task.aiSummary && <AiSummaryCard key={task.id} summary={task.aiSummary} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};