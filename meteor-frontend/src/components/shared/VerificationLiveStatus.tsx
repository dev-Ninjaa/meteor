import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, RefreshCw, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface VerificationLiveStatusProps {
  taskId: string;
  verificationType: string;
}

export const VerificationLiveStatus: React.FC<VerificationLiveStatusProps> = ({
  taskId,
  verificationType,
}) => {
  const [step, setStep] = useState<number>(0);

  const STEPS = [
    { label: 'AI Checking Output...', icon: Bot, duration: 1000 },
    { label: 'Verifying Swarm Requirements...', icon: ShieldCheck, duration: 1200 },
    { label: 'Consensus in Progress...', icon: RefreshCw, duration: 1000 },
    { label: 'Payment Processing on Monad...', icon: Zap, duration: 800 },
    { label: `Verified & Released!`, icon: CheckCircle2, duration: 800 },
  ];

  useEffect(() => {
    let timeout: any;
    if (step < STEPS.length - 1) {
      timeout = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, STEPS[step].duration);
    } else {
      timeout = setTimeout(() => {
        // onComplete();
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [step]);

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
      <motion.div
        key={step}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-16 h-16 rounded-full bg-[#836EF9]/20 border border-[#836EF9]/40 flex items-center justify-center text-[#836EF9] shadow-2xl shadow-[#836EF9]/30"
      >
        <CurrentIcon
          className={`w-8 h-8 ${step < STEPS.length - 1 ? 'animate-spin-slow text-[#836EF9]' : 'text-emerald-400'}`}
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
          {step === STEPS.length - 1
            ? 'Monad sub-second smart contract settlement confirmed.'
            : 'Evaluating submission against consensus vectors...'}
        </p>
      </div>

      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
        <motion.div
          className="h-full bg-[#836EF9]"
          initial={{ width: '0%' }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="text-xs text-white/50 font-mono">
        Task: {taskId.slice(0, 8)}... | Type: {verificationType}
      </div>
    </div>
  );
};
