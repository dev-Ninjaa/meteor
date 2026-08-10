import React from 'react';
import { VerificationType } from '../../types';
import { Bot, UserCheck, Sparkles, Users, GitMerge } from 'lucide-react';

interface VerificationBadgeProps {
  type: VerificationType;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ type, className = '' }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'AI Verification':
        return {
          icon: Bot,
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          label: 'AI Verification',
        };
      case 'AI First':
        return {
          icon: Sparkles,
          bg: 'bg-[#836EF9]/10 text-[#836EF9] border-[#836EF9]/20',
          label: 'AI First',
        };
      case 'Consensus':
        return {
          icon: Users,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Consensus',
        };
      case 'Creator Review':
        return {
          icon: UserCheck,
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Creator Review',
        };
      case 'Hybrid':
        return {
          icon: GitMerge,
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          label: 'Hybrid Pipeline',
        };
      default:
        return {
          icon: Bot,
          bg: 'bg-white/10 text-white/80 border-white/10',
          label: type,
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${style.bg} ${className}`}
    >
      <Icon className="w-3 h-3" />
      <span>{style.label}</span>
    </span>
  );
};
