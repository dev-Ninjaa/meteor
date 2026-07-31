import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, Sparkles, X } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto p-4 rounded-2xl liquid-glass border border-white/15 bg-black/90 text-white shadow-2xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden"
          >
            {/* Ambient Monad Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#836EF9]/15 blur-2xl pointer-events-none" />

            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'monad' && <Sparkles className="w-5 h-5 text-[#836EF9] animate-pulse" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 pr-4">
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                {toast.title}
              </h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
