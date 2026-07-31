import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap } from 'lucide-react';
import { VerificationBadge } from '../shared/VerificationBadge';
import { SubmissionRenderer } from '../shared/SubmissionRenderer';
import { VerificationLiveStatus } from '../shared/VerificationLiveStatus';

export const InteractiveSolverModal: React.FC = () => {
  const { selectedTask, isSolveModalOpen, setIsSolveModalOpen, acceptAndCompleteTask } = useAppStore();
  const [submission, setSubmission] = useState<any>('');
  const [isLiveVerifying, setIsLiveVerifying] = useState(false);

  if (!isSolveModalOpen || !selectedTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLiveVerifying) return;
    setIsLiveVerifying(true);
  };

  const handleLiveVerificationComplete = async () => {
    await acceptAndCompleteTask(selectedTask.id, submission);
    setIsLiveVerifying(false);
    setIsSolveModalOpen(false);
    setSubmission('');
  };

  return (
    <AnimatePresence>
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
              reward={selectedTask.reward}
              onComplete={handleLiveVerificationComplete}
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
                    className="bg-white text-black font-semibold text-xs rounded-full px-6 py-2.5 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
                    <span>Submit & Claim {selectedTask.reward}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
