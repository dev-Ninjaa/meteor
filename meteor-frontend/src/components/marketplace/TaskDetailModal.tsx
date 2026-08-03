import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Clock, ShieldCheck, ArrowUpRight, DollarSign, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { TaskItem } from '../../types';
import { VerificationBadge } from '../shared/VerificationBadge';
import { ProgressIndicator } from '../shared/ProgressIndicator';
import { useAppStore } from '../../store/useAppStore';
import { submissionsApi } from '../../lib/api';
import { useToast } from '@/hooks/useToast';
import { useJoinTask } from '@/hooks/useTasks';

interface TaskDetailModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSolve: (task: TaskItem) => void;
  onClaim: (task: TaskItem) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  isOpen, 
  onClose, 
  onSolve,
  onClaim
}) => {
  if (!isOpen || !task) return null;

  const verificationTypeMap: Record<string, string> = {
    'AI': 'AI Verification',
    'MANUAL': 'Human Review',
    'BOTH': 'Hybrid',
  };

  const verificationType = (verificationTypeMap[task.verificationMode] || 'AI Verification') as import('../../types').VerificationType;

  const { setManualVerificationData, setIsManualVerifyModalOpen, walletAddress, userId } = useAppStore();
  const { toast } = useToast();
  const { mutate: joinTask } = useJoinTask();
  const [isJoining, setIsJoining] = useState(false);

  // Handle join then open solver
  const handleJoinThenSolve = async (task: TaskItem) => {
    setIsJoining(true);
    try {
      await joinTask(task.id);
      onSolve(task);
      onClose();
    } catch (error: any) {
      console.error('Join failed:', error);
      if (error.response?.data?.message?.includes('Cannot join your own task')) {
        toast('You cannot join your own task', 'destructive');
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Determine task state for button logic
  const hasSubmission = !!task.mySubmission;
  const isCompleted = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const isVerified = task.mySubmission?.verification?.status === 'PASSED' || task.mySubmission?.verification?.status === 'APPROVED';
  const hasClaimed = task.mySubmission?.claimed === true;
  const canClaim = isCompleted && hasSubmission && isVerified && !hasClaimed;

  // Check if current user is the creator
  const isCreator = task.createdById === userId;

  // Render action buttons based on task state
  const renderActionButtons = () => {
    // Worker can claim payout
    if (canClaim) {
      return (
        <button
          onClick={() => { onClaim(task); onClose(); }}
          className="flex-1 bg-emerald-500 text-white font-semibold py-3 rounded-2xl hover:bg-emerald-500/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          <DollarSign className="w-4 h-4" />
          <span>Claim Payout ({task.reward} MON)</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      );
    }

    // Already claimed
    if (task.mySubmission?.claimed === true) {
      return (
        <div className="flex-1 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Payment Claimed ✓</span>
        </div>
      );
    }

    // No submission yet - WORKER can submit (NOT creator)
    if (!task.mySubmission && !isCompleted && !isCreator) {
      return (
        <button
          onClick={() => handleJoinThenSolve(task)}
          disabled={isJoining}
          className="flex-1 bg-[#836EF9] text-white font-semibold py-3 rounded-2xl hover:bg-[#836EF9]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#836EF9]/30 disabled:opacity-50"
        >
          {isJoining ? 'Joining...' : 'Accept & Submit Task'}
          <ArrowUpRight className="w-4 h-4" />
        </button>
      );
    }

    // CREATOR with no submissions yet - show task management
    if (!task.mySubmission && !isCompleted && isCreator) {
      return (
        <div className="flex-1 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white/60 font-semibold flex items-center justify-center gap-2">
          <span>Your Task - Waiting for Workers</span>
        </div>
      );
    }

    // Submission awaiting verification - CREATOR sees manual verify button
    if (task.mySubmission && !isVerified && !task.mySubmission?.claimed && !canClaim) {
      if (isCreator && (task.verificationMode === 'MANUAL' || task.verificationMode === 'BOTH')) {
        return (
          <button
            onClick={() => {
              if (task.mySubmission) {
                setManualVerificationData({
                  submissionId: task.mySubmission.id,
                  taskId: task.id,
                  taskTitle: task.title,
                  submissionContent: task.mySubmission.content,
                  reward: task.reward,
                });
                setIsManualVerifyModalOpen(true);
                onClose();
              }
            }}
            className="flex-1 bg-amber-500 text-white font-semibold py-3 rounded-2xl hover:bg-amber-500/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Review Submission</span>
          </button>
        );
      }
      return (
        <div className="flex-1 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Awaiting Verification</span>
        </div>
      );
    }

    if (task.mySubmission?.claimed === true && canClaim) {
      return (
        <div className="flex-1 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Payment Claimed ✓</span>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                  {task.category}
                </span>
                <VerificationBadge type={verificationType} />
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Title & Reward */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                      {task.category}
                    </span>
                  </div>
                  <h2 className="font-heading italic text-3xl text-white leading-tight">{task.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-white/50 shrink-0">
                  <Zap className="w-5 h-5 text-[#836EF9]" />
                  <span className="font-mono text-xl font-bold">{task.reward}</span>
                  <span className="text-white/40">MON</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                <h3 className="font-heading italic text-lg text-white mb-2">Description</h3>
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Task Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
                    Reward per Worker
                  </div>
                  <div className="font-mono text-xl text-white">{task.reward} MON</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Workers
                  </div>
                  <div className="font-mono text-xl text-white">{task.workersJoined} / {task.workersRequired}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Duration
                  </div>
                  <div className="font-mono text-xl text-white">{task.duration || '10 mins'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verification
                  </div>
                  <div className="font-mono text-sm text-white capitalize">{verificationType}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-6 rounded-2xl bg-[#111113] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-white/60">Progress</span>
                  <span className="text-xs font-mono text-white/60">
                    {task.workersCompleted} / {task.workersRequired} completed
                  </span>
                </div>
                <ProgressIndicator joined={task.workersCompleted} required={task.workersRequired} />
                <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                  <span>Status: <span className="text-white font-mono">{task.status}</span></span>
                  <span>Escrow: <span className="text-white font-mono">{task.escrowStatus}</span></span>
                </div>
              </div>

              {/* My Submission Status */}
              {task.mySubmission && (
                <div className="p-4 rounded-2xl bg-[#111113] border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono text-emerald-400">Your Submission</span>
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2">{task.mySubmission.content}</p>
                  {task.mySubmission.verification && (
                    <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className={`w-4 h-4 ${
                          task.mySubmission.verification.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'
                        }`} />
                        <span className="font-mono text-white/80">Verification: {task.mySubmission.verification.status}</span>
                      </div>
                      {task.mySubmission.verification.score && (
                        <div className="text-xs text-white/60">Score: {task.mySubmission.verification.score}/100</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <span>Close</span>
                </button>

                {renderActionButtons()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
  );
};