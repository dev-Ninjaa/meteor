import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Zap, RefreshCw, Sparkles, DollarSign } from 'lucide-react';

export const InteractiveSolverModal: React.FC = () => {
  const { selectedTask, isSolveModalOpen, setIsSolveModalOpen, acceptAndCompleteTask } = useAppStore();
  const [submission, setSubmission] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSolveModalOpen || !selectedTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission.trim() || isVerifying) return;

    setIsVerifying(true);
    await acceptAndCompleteTask(selectedTask.id, submission);
    setIsVerifying(false);
    setIsSolveModalOpen(false);
    setSubmission('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/20 bg-black/90 text-white shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#836EF9]/20 text-[#836EF9] border border-[#836EF9]/30">
                {selectedTask.category}
              </span>
              <h3 className="text-lg font-semibold text-white mt-1.5">{selectedTask.title}</h3>
            </div>
            <button
              onClick={() => setIsSolveModalOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Task Meta details */}
            <div className="p-4 rounded-2xl bg-[#111113] border border-white/10 space-y-2">
              <div className="text-xs text-white/70">{selectedTask.description}</div>
              {selectedTask.instructions && (
                <div className="mt-2 text-xs font-mono text-white/50 border-t border-white/5 pt-2">
                  <span className="text-white/80 font-bold">Instructions:</span> {selectedTask.instructions}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="text-white/40 font-mono">Reward:</span>
                <span className="text-[#836EF9] font-bold font-mono">{selectedTask.reward}</span>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/60 mb-2 block uppercase tracking-wider">
                  Your Verification / Output Proof
                </label>
                <textarea
                  rows={4}
                  required
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder="Enter detailed verification results, audit findings, or task output..."
                  className="w-full bg-[#111113] border border-white/15 rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Dual AI Audit Consensus</span>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="bg-white text-black font-semibold text-xs rounded-full px-6 py-2.5 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#836EF9]" />
                      <span>Auditing Output...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
                      <span>Submit & Claim {selectedTask.reward}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
