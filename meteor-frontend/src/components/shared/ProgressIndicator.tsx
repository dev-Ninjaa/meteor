import React from 'react';

interface ProgressIndicatorProps {
  joined: number;
  required: number;
  className?: string;
  showText?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  joined,
  required,
  className = '',
  showText = true,
}) => {
  const percentage = Math.min(100, Math.round((joined / Math.max(1, required)) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-1.5">
          <span>Swarm Consensus Progress</span>
          <span className="text-white font-semibold">
            {joined} / {required} ({percentage}%)
          </span>
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#836EF9] to-emerald-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
