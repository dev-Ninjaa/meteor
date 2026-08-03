import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = '',
}: ModalWrapperProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`liquid-glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar ${className}`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#836EF9]/20 text-[#836EF9] flex items-center justify-center border border-[#836EF9]/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading italic text-2xl text-white">{title}</h3>
                  {subtitle && <p className="text-xs text-white/50 font-mono">{subtitle}</p>}
                </div>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}