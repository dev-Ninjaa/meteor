import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Clock, ChevronDown } from 'lucide-react';
import { TaskItem, VerificationType } from '../../types';
import { VerificationBadge } from '../../components/shared/VerificationBadge';
import { ProgressIndicator } from '../../components/shared/ProgressIndicator';

interface TaskCardProps {
  task: TaskItem;
  index: number;
  onClick: (task: TaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onClick={() => onClick(task)}
      className="liquid-glass rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between backdrop-blur-xl bg-black/40 group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {task.category}
          </span>
          <VerificationBadge type={task.verificationType as VerificationType} />
        </div>
        <h3 className="font-heading italic text-xl text-white group-hover:text-[#836EF9] transition-colors mb-2 line-clamp-2">
          {task.title}
        </h3>
        <p className="text-xs text-white/60 line-clamp-2 mb-4 font-light">
          {task.description}
        </p>
      </div>
      <div className="space-y-3">
        <ProgressIndicator joined={task.workersJoined} required={task.workersRequired} />
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#836EF9]" />
            {task.reward} MON
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {task.workersJoined}/{task.workersRequired}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {task.duration || '10 mins'}
          </span>
          <span className="text-[#836EF9] flex items-center gap-1 group-hover:underline">
            <span>View Details</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
