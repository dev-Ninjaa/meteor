import { useState } from 'react';
import { useSubmissions } from '@/hooks';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Send, RefreshCw, DollarSign, CheckCircle2 } from 'lucide-react';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { SubmissionRenderer } from '../../components/shared/SubmissionRenderer';
import { VerificationLiveStatus } from '../../components/shared/VerificationLiveStatus';
import { useToast } from '@/hooks/useToast';
import { ClaimPayoutModal } from './ClaimPayoutModal';

export const SubmitWorkModal: React.FC = () => {
  const { selectedTask, isSolveModalOpen, setIsSolveModalOpen, setSelectedTask, setIsDetailModalOpen } = useAppStore();
  const { create: createSubmission, verifyAi: verifyAiSubmission } = useSubmissions();
  const [submission, setSubmission] = useState<string | number>('');
  const [isLiveVerifying, setIsLiveVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const { toast } = useToast();

  if (!isSolveModalOpen || !selectedTask) return null;

  const isEmpty = typeof submission === 'string' ? !submission.trim() : !submission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isEmpty) return;

    setIsSubmitting(true);
    try {
      // Create submission
      const newSubmissionResponse = await createSubmission.mutateAsync({
        taskId: selectedTask.id,
        data: {
          content: String(submission),
          proof: typeof submission === 'string' && submission.startsWith('http') ? submission : undefined,
          submissionType: selectedTask.submissionType,
        },
      });
      const newSubmission = newSubmissionResponse.data;

      // If AI verification, trigger it
      if (selectedTask.verificationType === 'AI Verification' || selectedTask.verificationType === 'Hybrid') {
        setIsLiveVerifying(true);
        const verifyResponse = await verifyAiSubmission.mutateAsync(newSubmission.id);
        const verifiedSubmission = verifyResponse.data;
        setIsLiveVerifying(false);

        const passed = verifiedSubmission?.status === 'APPROVED' || verifiedSubmission?.verification?.status === 'PASSED';
        // Abort on rejection so the modal stays open and the worker sees the failure.
        if (!passed) {
          throw new Error('Submission was not approved');
        }

        // AI verification passed - show Claim Payout modal directly
        const updatedTask: typeof selectedTask = {
          ...selectedTask,
          mySubmission: {
            id: verifiedSubmission.id,
            content: verifiedSubmission.content,
            proof: verifiedSubmission.proof,
            submissionType: verifiedSubmission.submissionType ?? 'text',
            status: verifiedSubmission.status,
            claimed: verifiedSubmission.claimed ?? false,
            aiScore: verifiedSubmission.aiScore,
            aiFeedback: verifiedSubmission.aiFeedback,
            taskId: verifiedSubmission.taskId,
            workerId: verifiedSubmission.workerId,
            createdAt: verifiedSubmission.createdAt,
            updatedAt: verifiedSubmission.updatedAt,
            verification: verifiedSubmission.verification ? {
              id: verifiedSubmission.verification.id,
              status: verifiedSubmission.verification.status,
              aiScore: verifiedSubmission.verification.aiScore,
              aiFeedback: verifiedSubmission.verification.aiFeedback,
              manualNotes: verifiedSubmission.verification.manualNotes,
              isManual: verifiedSubmission.verification.isManual,
              verifiedById: verifiedSubmission.verification.verifiedById,
            } : null,
          },
          status: 'COMPLETED',
          escrowStatus: 'LOCKED',
        };
        setSelectedTask(updatedTask);
        setIsSolveModalOpen(false);
        setShowClaimModal(true);
        return;
      }

      // For MANUAL verification tasks - just submitted, awaiting verification
      setIsSolveModalOpen(false);
      setSubmission('');
      toast('Submission successful! Awaiting manual verification.', 'success');
    } catch (error: any) {
      console.error('Submission failed:', error);
      if (error.message === 'Submission was not approved') {
        toast('Submission was not approved. Please try again.', 'destructive');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Submit Work Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                  {selectedTask.category}
                </span>
                <VerificationBadge type={selectedTask.verificationType} />
              </div>
              <h3 className="text-lg font-semibold text-white">{selectedTask.title}</h3>
            </div>
            <button
              onClick={() => {
                setIsSolveModalOpen(false);
                setIsLiveVerifying(false);
              }}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLiveVerifying ? (
                      <VerificationLiveStatus
                        taskId={selectedTask.id}
                        verificationType={selectedTask.verificationType}
                        onComplete={() => {
                          // When verification completes, update task and show claim modal
                          const updatedTask: typeof selectedTask = {
                            ...selectedTask,
                            status: 'COMPLETED',
                            escrowStatus: 'LOCKED',
                          };
                          setSelectedTask(updatedTask);
                          setIsSolveModalOpen(false);
                          setShowClaimModal(true);
                          toast('Submission approved! You can now claim your payout.', 'success');
                        }}
                      />
            ) : (
              <div className="mt-4 space-y-4">
                {/* Task Details */}
                <div className="p-4 rounded-2xl bg-[#111113] border border-white/10 space-y-2">
                  <div className="text-xs text-white/80">{selectedTask.description}</div>
                  {selectedTask.instructions && (
                    <div className="mt-2 text-xs font-mono text-white/50 border-t border-white/5 pt-2">
                      <span className="text-white/80 font-bold">Instructions:</span> {selectedTask.instructions}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-white/40">Reward per Worker:</span>
                    <span className="text-[#836EF9] font-bold">{selectedTask.reward}</span>
                  </div>
                </div>

                {/* Submission Renderer */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <SubmissionRenderer
                    type={selectedTask.submissionType}
                    options={selectedTask.options}
                    value={submission}
                    onChange={setSubmission}
                  />

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Instant Smart Settlement</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isEmpty}
                      className="bg-white text-black font-semibold text-xs rounded-full px-6 py-2.5 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#836EF9]" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Work</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

        </motion.div>
      </div>

      {/* Claim Payout Modal */}
      <ClaimPayoutModal
        task={selectedTask}
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onSuccess={() => {
          setShowClaimModal(false);
          // Optionally refresh queries
        }}
      />

    </AnimatePresence>
      );
    };