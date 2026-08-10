import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface VerificationLiveStatusProps {
  taskId: string;
  verificationType: string;
  onComplete?: () => void;
}

export const VerificationLiveStatus: React.FC<VerificationLiveStatusProps> = ({
  taskId,
  verificationType,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isRealComplete, setIsRealComplete] = useState(false);

  const STEPS = [
    { label: 'AI Checking Output...', icon: Bot, duration: 3000 },
    { label: 'Verifying Swarm Requirements...', icon: ShieldCheck, duration: 3000 },
    { label: 'Consensus in Progress...', icon: RefreshCw, duration: 3000 },
    { label: 'Payment Processing on Monad...', icon: Zap, duration: 2000 },
    { label: `Verified & Released!`, icon: CheckCircle2, duration: 1500 },
  ];

  // Animation timer
  useEffect(() => {
    if (step >= STEPS.length - 1) return;
    const timeout = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, STEPS[step].duration);
    return () => clearTimeout(timeout);
  }, [step]);

  // Listen for actual verification completion via socket
  useEffect(() => {
    // This would ideally connect to your socket system
    // For now, we'll poll the task status as a fallback
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/tasks/${taskId}`);
        if (res.ok) {
          const data = await res.json();
          const task = data?.data;
          if (task?.mySubmission?.verification?.status === 'PASSED' || 
              task?.mySubmission?.verification?.status === 'APPROVED') {
            setIsRealComplete(true);
            setStep(STEPS.length - 1);
            onComplete?.();
            clearInterval(interval);
          } else if (task?.mySubmission?.verification?.status === 'FAILED' ||
                     task?.mySubmission?.verification?.status === 'REJECTED') {
            // Handle rejection
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('Verification status check failed:', e);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [taskId, onComplete]);

  const CurrentIcon = STEPS[step].icon;
  const isComplete = step === STEPS.length - 1 && isRealComplete;

  return (
    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
      <motion.div
        key={step}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ${
          isComplete
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-[#836EF9]/20 border-[#836EF9]/40 text-[#836EF9] shadow-[#836EF9]/30'
        }`}
      >
        <CurrentIcon
          className={`w-8 h-8 ${
            isComplete ? '' : 'animate-spin-slow'
          } ${isComplete ? 'text-emerald-400' : 'text-[#836EF9]'} 
          `}
        />
      </motion.div>

      <div>
        <div className="text-xs font-mono text-[#836EF9] uppercase font-semibold mb-1">
          Live Verification Engine
        </div>
        <h4 className="font-heading italic text-2xl text-white tracking-tight">
          {STEPS[step].label}
        </h4>
        <p className="text-xs text-white/50 font-mono mt-1">
          {isComplete 
            ? 'Monad sub-second smart contract settlement confirmed.'
            : 'Evaluating submission against consensus vectors...'}
        </p>
      </div>

      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
        <motion.div
          className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-[#836EF9]'} 
          transition-all duration-500`}
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="text-xs text-white/50 font-mono">
        Task: {taskId.slice(0, 8)}... | Type: {verificationType}
        {isComplete && ' — ✅ Complete'}
      </div>
    </div>
  );
};
