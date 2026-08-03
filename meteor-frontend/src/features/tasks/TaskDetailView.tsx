import { useState, useEffect } from 'react';
import { useTask, useJoinTask, useCreateSubmission, useMarketplace } from '@/hooks';
import { formatAddress } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FadingVideo } from '@/components/shared/FadingVideo';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { SubmissionRenderer } from '@/components/shared/SubmissionRenderer';
import { VerificationLiveStatus } from '@/components/shared/VerificationLiveStatus';
import { WalletConnectButton } from '@/components/ui/WalletConnectButton';
import { useWriteBountyEscrowClaimPayment } from '@/lib/generated';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Clock, Zap, Users, AlertCircle,
  Send, FileText, Image, Video, MapPin, Mic, ExternalLink,
  Loader2, ShieldCheck, X, ChevronDown, ChevronUp, DollarSign, Wallet, ArrowDown } from 'lucide-react';

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
}

const SUBMISSION_TYPES = {
  text: { label: 'Text Response', icon: FileText },
  multiple_choice: { label: 'Multiple Choice', icon: CheckCircle2 },
  rating: { label: 'Rating (1-5)', icon: ShieldCheck },
  image: { label: 'Image Upload', icon: Image },
  video: { label: 'Video Recording', icon: Video },
  gps: { label: 'GPS / Location', icon: MapPin },
  screen_recording: { label: 'Screen Recording', icon: Video },
  audio: { label: 'Audio Recording', icon: Mic },
  file: { label: 'File Upload', icon: FileText },
  link: { label: 'Link Submission', icon: ExternalLink },
  checklist: { label: 'Verification Checklist', icon: CheckCircle2 },
  multi_field: { label: 'Multi-Field Form', icon: FileText },
};

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ taskId, onBack }) => {
  const { data: task, isLoading, error, refetch } = useTask(taskId);
  const joinMutation = useJoinTask();
  const submitMutation = useCreateSubmission();
  const { address } = useAccount();
  const { writeContractAsync: claimPayment } = useWriteBountyEscrowClaimPayment();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'verify'>('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionProof, setSubmissionProof] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [mySubmission, setMySubmission] = useState<{
    id: string;
    status: string;
    verified: boolean;
    claimed: boolean;
    content: string;
    createdAt: string;
  } | null>(null);

  // Fetch worker's submission for this task
  useEffect(() => {
    if (task && address) {
      // In a real app, you'd call an API to get the current user's submission
      // For now we'll check if the worker has joined and has submissions
      // This would be replaced with actual API call
    }
  }, [task, address]);

  const claimWorkerPayment = async () => {
    if (!address || !task) return;
    
    setIsClaiming(true);
    try {
      // Convert UUID to bytes32 for contract
      const { keccak256, toHex } = await import('viem');
      const taskIdBytes32 = keccak256(toHex(task.id));
      const txHash = await claimPayment({
        args: [taskIdBytes32 as `0x${string}`],
      });
      console.log('Worker claimed payment:', txHash);
      alert('Payment claimed successfully!');
      refetch();
    } catch (err) {
      console.error('Claim payment failed:', err);
      alert('Failed to claim payment. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#836EF9]" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-white/60">Task not found</p>
        <button onClick={onBack} className="mt-4 text-[#836EF9] hover:underline">Go Back</button>
      </div>
    );
  }

  // Backend Task type fields: title, description, reward, status, tags, workersRequired, workersJoined, workersCompleted, maxWorkers, verificationMode, escrowStatus, createdById, createdAt, updatedAt
  const VERIFICATION_TYPE_MAP: Record<string, string> = {
    'AI': 'AI Verification',
    'MANUAL': 'Human Review',
    'BOTH': 'Hybrid',
  };
  
  const verificationType = VERIFICATION_TYPE_MAP[task.verificationMode] || task.verificationMode;
  const submissionTypeInfo = SUBMISSION_TYPES['text'] || { label: 'Text Response', icon: FileText };
  const SubmissionIcon = submissionTypeInfo.icon;

  const isJoined = task.workersJoined > 0 && task.status !== 'OPEN';
  const canSubmit = isJoined && (task.status === 'OPEN' || task.status === 'IN_PROGRESS');
  const isFullyCompleted = task.status === 'COMPLETED' || task.workersCompleted >= task.workersRequired;
  const hasSubmitted = isJoined && task.workersCompleted > 0;
  const escrowLocked = task.escrowStatus === 'LOCKED';
  const canClaim = hasSubmitted && escrowLocked; // Can claim if submitted AND escrow locked (regardless of completion)
  const hasClaimed = isJoined && task.workersCompleted >= task.workersRequired && task.status === 'COMPLETED';

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync(taskId);
      refetch();
    } catch (err) {
      console.error('Failed to join task:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        taskId,
        data: {
          content: submissionContent,
          proof: submissionProof || undefined,
        },
      });
      setShowSubmitModal(false);
      setSubmissionContent('');
      setSubmissionProof('');
      refetch();
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
      />
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="liquid-glass rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                  {task.tags?.[0] || 'Task'}
                </span>
                <VerificationBadge type={verificationType as any} />
              </div>
              <h1 className="font-heading italic text-3xl text-white leading-tight">
                {task.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WalletConnectButton />
            <div className="liquid-glass rounded-full px-4 py-2 text-xs font-mono text-white/90 border border-white/10 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
              <span>{task.reward}</span>
            </div>
          </div>
        </motion.div>

        {/* Task Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="liquid-glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
              Reward per Worker
            </div>
            <div className="font-mono text-xl text-white">{task.reward}</div>
          </div>
          <div className="liquid-glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              Workers
            </div>
            <div className="font-mono text-xl text-white">
              {task.workersJoined} / {task.workersRequired}
            </div>
          </div>
          <div className="liquid-glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              Duration
            </div>
            <div className="font-mono text-xl text-white">10 mins</div>
          </div>
          <div className="liquid-glass rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
              <SubmissionIcon className="w-3.5 h-3.5" />
              Submission Type
            </div>
            <div className="font-mono text-sm text-white capitalize">{submissionTypeInfo.label}</div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-2xl p-6 border border-white/10 mb-8"
        >
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
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-2xl p-6 border border-white/10 mb-8"
        >
          <h3 className="font-heading italic text-xl text-white mb-3">Task Description</h3>
          <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          
          {task.tags && task.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-mono text-white/50 mb-2 uppercase tracking-wider">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {!isJoined && task.status === 'OPEN' && (
            <button
              onClick={handleJoin}
              disabled={joinMutation.isPending}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Users className="w-5 h-5" />
              <span>Join Task ({task.workersRequired - task.workersJoined} spots left)</span>
            </button>
          )}

          {isJoined && canSubmit && !isFullyCompleted && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex-1 bg-[#836EF9] text-white font-semibold py-3 rounded-2xl hover:bg-[#836EF9]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#836EF9]/30"
            >
              <Send className="w-5 h-5" />
              <span>Submit Work</span>
            </button>
          )}

          {canClaim && !hasClaimed && (
            <button
              onClick={claimWorkerPayment}
              disabled={isClaiming}
              className="flex-1 bg-emerald-500 text-white font-semibold py-3 rounded-2xl hover:bg-emerald-500/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
            >
              <DollarSign className="w-5 h-5" />
              <span>{isClaiming ? 'Claiming...' : `Claim ${task.reward}`}</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {hasClaimed && (
            <div className="flex-1 liquid-glass rounded-2xl py-3 text-center text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
              <span className="font-mono">Payment Claimed ✓</span>
            </div>
          )}

          {isFullyCompleted && !hasClaimed && !canClaim && (
            <div className="flex-1 liquid-glass rounded-2xl py-3 text-center text-white/60 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="font-mono">Task Completed</span>
            </div>
          )}
        </motion.div>

        {/* Tabs for Submissions & Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="flex border-b border-white/10">
            {['overview', 'submissions', 'verify'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 px-4 text-xs font-mono transition-all ${
                  activeTab === tab
                    ? 'bg-white/5 text-white border-b-2 border-[#836EF9]'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4 text-white/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-mono text-white/50">Created by:</span> <span className="font-mono">{formatAddress(task.createdById)}</span></div>
                  <div><span className="font-mono text-white/50">Created at:</span> <span className="font-mono">{task.createdAt}</span></div>
                  <div><span className="font-mono text-white/50">Verification:</span> <span className="font-mono">{task.verificationMode}</span></div>
                  <div><span className="font-mono text-white/50">Max Workers:</span> <span className="font-mono">{task.maxWorkers}</span></div>
                  <div><span className="font-mono text-white/50">AI Generated:</span> <span className="font-mono">{task.aiGenerated ? 'Yes' : 'No'}</span></div>
                  <div><span className="font-mono text-white/50">AI Prompt:</span> <span className="font-mono text-white/70 truncate">{task.aiPrompt || 'N/A'}</span></div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <p className="text-white/50 text-sm">Submissions will appear here once workers submit their work.</p>
                {/* Submissions would be fetched via useSubmissions hook */}
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="space-y-4">
                <VerificationLiveStatus 
                  taskId={task.id}
                  verificationType={task.verificationMode}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="liquid-glass rounded-3xl p-6 max-w-lg w-full border border-white/20 bg-black/95 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-heading italic text-2xl text-white">Submit Work</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">
                  Your Submission
                </label>
                <textarea
                  rows={6}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Describe what you did, findings, results..."
                  className="w-full bg-[#111113] border border-white/20 rounded-xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">
                  Proof / Evidence (Optional)
                </label>
                <input
                  type="text"
                  value={submissionProof}
                  onChange={(e) => setSubmissionProof(e.target.value)}
                  placeholder="GitHub PR link, screenshot URL, document link..."
                  className="w-full bg-[#111113] border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitMutation.isPending || !submissionContent.trim()}
                  className="bg-white text-black font-semibold text-xs rounded-full px-6 py-3 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting || submitMutation.isPending ? 'Submitting...' : 'Submit Work'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailView;