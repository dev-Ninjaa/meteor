import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { submissionsApi } from '../../lib/api';
import { useToast } from '@/hooks/useToast';

export const ManualVerificationModal: React.FC = () => {
  const { 
    manualVerificationData, 
    isManualVerifyModalOpen, 
    setIsManualVerifyModalOpen,
    walletAddress 
  } = useAppStore();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isManualVerifyModalOpen || !manualVerificationData) return null;

  const handleSubmit = async () => {
    if (!manualVerificationData) return;
    
    setIsSubmitting(true);
    try {
      await submissionsApi.verifyManual(manualVerificationData.submissionId, {
        status: verificationStatus,
        manualNotes: notes || undefined,
      });
      
      toast(
        verificationStatus === 'APPROVED' ? 'Submission approved' : 'Submission rejected',
        'success'
      );
      setIsManualVerifyModalOpen(false);
    } catch (error) {
      toast('Failed to verify submission', 'destructive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
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
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Manual Review Required
              </span>
            </div>
            <button
              onClick={() => setIsManualVerifyModalOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Task Info */}
            <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
              <h3 className="font-heading italic text-lg text-white mb-2">Task: {manualVerificationData.taskTitle}</h3>
              <p className="text-xs text-white/60">Reward: {manualVerificationData.reward} MON</p>
            </div>

            {/* Submission Content */}
            <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
              <h4 className="font-mono text-white/70 mb-2 text-xs uppercase tracking-wider">Submission to Review</h4>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 min-h-[120px] max-h-60 overflow-y-auto">
                <p className="text-white/80 whitespace-pre-wrap text-sm leading-relaxed">{manualVerificationData.submissionContent}</p>
              </div>
            </div>

            {/* Verification Options */}
            <div className="p-4 rounded-2xl bg-[#111113] border border-white/10">
              <h4 className="font-mono text-white/70 mb-4 text-xs uppercase tracking-wider">Verification Decision</h4>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setVerificationStatus('APPROVED')}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border-2 ${
                    verificationStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <CheckCircle2 className={`w-8 h-8 ${verificationStatus === 'APPROVED' ? 'text-emerald-400' : 'text-white/30'}`} />
                  <span className="font-semibold">Approve</span>
                  <span className="text-xs text-white/40">Submission meets requirements</span>
                </button>
                
                <button
                  onClick={() => setVerificationStatus('REJECTED')}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl transition-all border-2 ${
                    verificationStatus === 'REJECTED'
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <XCircle className={`w-8 h-8 ${verificationStatus === 'REJECTED' ? 'text-red-400' : 'text-white/30'}`} />
                  <span className="font-semibold">Reject</span>
                  <span className="text-xs text-white/40">Submission doesn't meet requirements</span>
                </button>
              </div>

              {/* Notes (required for rejection) */}
              {(verificationStatus === 'REJECTED') && (
                <div className="mb-4">
                  <label className="block text-xs font-mono text-white/60 mb-2">Rejection Notes (required)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Explain why this submission was rejected..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/40 focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all resize-none"
                    required
                  />
                  <p className="text-xs text-white/40 mt-1">Required when rejecting</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsManualVerifyModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-black font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (verificationStatus === 'REJECTED' && !notes.trim())}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  verificationStatus === 'APPROVED'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-500/90 shadow-lg shadow-emerald-500/30'
                    : 'bg-red-500 text-white hover:bg-red-500/90 shadow-lg shadow-red-500/30'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isSubmitting 
                    ? 'Submitting...' 
                    : verificationStatus === 'APPROVED' 
                      ? 'Approve Submission' 
                      : 'Reject Submission'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};