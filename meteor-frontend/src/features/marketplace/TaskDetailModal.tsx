import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Users, Clock, ShieldCheck, ArrowUpRight, DollarSign, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useAccount } from 'wagmi';
import { TaskItem } from '../../types';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { ProgressIndicator } from '../../components/shared/ProgressIndicator';
import { useAppStore } from '../../store/useAppStore';
import { submissionsApi } from '../../lib/api';
import { useToast } from '@/hooks/useToast';
import { useMe } from '@/hooks/useAuth';
import { useJoinTask, useTask } from '@/hooks/useTasks';
import { useSocket } from '@/hooks/useSocket';
import { usePayments } from '@/hooks/usePayments';
import { useWriteBountyEscrowClaimPayment } from '@/lib/generated';
import { getGasLimit } from '@/lib/utils';

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
    'MANUAL': 'Creator Review',
    'BOTH': 'Hybrid',
  };

  const verificationType = (verificationTypeMap[task.verificationMode] || 'AI Verification') as import('../../types').VerificationType;

  const { setManualVerificationData, setIsManualVerifyModalOpen } = useAppStore();
  const { data: currentUser } = useMe();
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
  
  // Can claim if: verified + not claimed + (task completed OR verification passed and escrow locked)
  const canClaim = hasSubmission && isVerified && !hasClaimed && (isCompleted || task.escrowStatus === 'LOCKED');

  // Check if current user is the creator (createdById is a DB UUID → compare with user id)
  const isCreator = task.createdById === currentUser?.id;

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
            className="liquid-glass rounded-3xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full mx-2 sm:mx-4 border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                      {task.category}
                    </span>
                  </div>
                  <h2 className="font-heading italic text-xl sm:text-2xl lg:text-3xl text-white leading-tight truncate">{task.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-white/50 shrink-0">
                  <Zap className="w-5 h-5 text-[#836EF9]" />
                  <span className="font-mono text-lg sm:text-xl font-bold">{task.reward}</span>
                  <span className="text-white/40">MON</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                <h3 className="font-heading italic text-lg text-white mb-2">Description</h3>
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>

              {/* Creator Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
                  <h3 className="font-heading italic text-lg text-white mb-3">Reference Files</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {task.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="rounded-xl bg-black/30 border border-white/10 overflow-hidden">
                        {attachment.type?.startsWith('image/') && attachment.preview && (
                          <img 
                            src={attachment.preview} 
                            alt={attachment.name || 'Attachment'} 
                            className="w-full h-32 object-cover"
                          />
                        )}
                        {attachment.type?.startsWith('video/') && attachment.preview && (
                          <video 
                            src={attachment.preview} 
                            controls 
                            className="w-full h-32"
                          />
                        )}
                        {attachment.type?.startsWith('audio/') && attachment.preview && (
                          <audio 
                            src={attachment.preview} 
                            controls 
                            className="w-full h-32"
                          />
                        )}
                        {!attachment.type?.startsWith('image/') && !attachment.type?.startsWith('video/') && !attachment.type?.startsWith('audio/') && (
                          <div className="flex items-center justify-center h-32 p-4">
                            <div className="text-center">
                              <span className="text-3xl">📄</span>
                              <p className="text-xs text-white/60 mt-1 truncate w-full">{attachment.name}</p>
                            </div>
                          </div>
                        )}
                        <div className="p-3 bg-black/20 border-t border-white/5">
                          <p className="text-xs font-mono text-white/70 truncate">{attachment.name}</p>
                          <p className="text-[10px] font-mono text-white/40 mt-1">
                            {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : ''}
                            {attachment.cid && ` • IPFS: ${attachment.cid.slice(0, 12)}...`}
                          </p>
                          {attachment.url && (
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-[#836EF9] underline mt-1 inline-block"
                            >
                              View on IPFS
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                      {task.mySubmission.verification.aiScore !== null && (
                        <div className="text-xs text-white/60">Score: {task.mySubmission.verification.aiScore}/100</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold transition-all border border-white/10 flex items-center justify-center gap-2 text-sm sm:text-base"
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

export const TaskDetailModalWrapper: React.FC = () => {
  const { selectedTask, isDetailModalOpen, setIsDetailModalOpen, setIsSolveModalOpen } = useAppStore();
  const { claimPayment } = usePayments();
  const { toast } = useToast();
  const { address, connector, chain } = useAccount();
  const { writeContractAsync: claimOnContract } = useWriteBountyEscrowClaimPayment();
  const [isClaiming, setIsClaiming] = useState(false);
  const queryClient = useQueryClient();
  const socket = useSocket();
  const taskId = selectedTask?.id ?? null;
  const { data: freshTask } = useTask(taskId ?? '');

  useEffect(() => {
    if (!taskId || !isDetailModalOpen) return;
    socket.subscribeToTask(taskId);
    return () => socket.unsubscribeFromTask(taskId);
  }, [taskId, isDetailModalOpen, socket]);

  useEffect(() => {
    if (freshTask && isDetailModalOpen) {
      useAppStore.getState().setSelectedTask(freshTask);
    }
  }, [freshTask, isDetailModalOpen]);

  useEffect(() => {
    if (!taskId || !isDetailModalOpen) return;
    const events = [
      'task.updated',
      'submission.created',
      'submission.approved',
      'submission.rejected',
      'verification.completed',
      'escrow.locked',
      'escrow.released',
      'escrow.refunded',
    ] as const;
    const unsubscribes = events.map((event) =>
      socket.on(event, (data: any) => {
        if (data?.taskId === taskId) {
          queryClient.invalidateQueries({ queryKey: ['task', taskId] });
          queryClient.invalidateQueries({ queryKey: ['marketplace'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      }),
    );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [taskId, isDetailModalOpen, socket, queryClient]);

  if (!selectedTask) return null;

  const handleClaim = async (task: TaskItem) => {
    if (!address || !connector) {
      toast('Connect your wallet to claim payment', 'destructive');
      return;
    }
    
    // Check if we're on the correct chain (Monad Testnet - 10143)
    if (chain?.id !== 10143) {
      toast('Please switch to Monad Testnet (Chain ID: 10143)', 'destructive');
      return;
    }
    
    setIsClaiming(true);
    try {
      // Sign claimPayment on the escrow contract (taskId UUID → bytes32)
      const { keccak256, toHex } = await import('viem');
      const taskIdBytes32 = keccak256(toHex(task.id));
      const txHash = await claimOnContract({
        args: [taskIdBytes32 as `0x${string}`],
        gas: getGasLimit('CLAIM_PAYMENT'),
      });

      await claimPayment.mutateAsync({ taskId: task.id, txHash });

      // Invalidate queries to refresh task data (mySubmission.claimed will be updated)
      queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast('Payment claimed successfully!', 'success');
      setIsDetailModalOpen(false);
    } catch (err: any) {
      console.error('Claim payment failed:', err);
      
      // Handle specific wallet authorization errors
      if (err?.name === 'UnauthorizedProviderError' || 
          err?.message?.includes('not been authorized') ||
          err?.message?.includes('User rejected') ||
          err?.cause?.name === 'UnauthorizedProviderError') {
        toast('Wallet connection required. Please reconnect your wallet and try again.', 'destructive');
      } else if (err?.message?.includes('Already claimed') || err?.message?.includes('Not eligible')) {
        toast('Payment already claimed or not eligible', 'destructive');
      } else if (err?.message?.includes('Exceeds locked amount') || err?.message?.includes('Task cancelled')) {
        toast('Task escrow issue - contact support', 'destructive');
      } else {
        const message = err?.response?.data?.message ?? err?.shortMessage ?? 'Failed to claim payment. Please try again.';
        toast(message, 'destructive');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <TaskDetailModal
      task={selectedTask}
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
      onSolve={(task) => {
        setIsDetailModalOpen(false);
        setIsSolveModalOpen(true);
      }}
      onClaim={(task) => {
        handleClaim(task);
      }}
    />
  );
};

export default TaskDetailModalWrapper;