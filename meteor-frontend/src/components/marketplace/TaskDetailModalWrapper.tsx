import React from 'react';
import { TaskDetailModal } from './TaskDetailModal';
import { useAppStore } from '../../store/useAppStore';

export const TaskDetailModalWrapper: React.FC = () => {
  const { selectedTask, isDetailModalOpen, setIsDetailModalOpen, setIsSolveModalOpen } = useAppStore();

  if (!selectedTask) return null;

  return (
    <TaskDetailModal
      task={selectedTask}
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
      onSolve={(task) => {
        setIsDetailModalOpen(false);
        setIsSolveModalOpen(true);
      }}
      onClaim={(task) => {
        // Trigger claim payout - the modal will handle the API call
        console.log('Claim payout for task:', task.id);
        // The onClaim in TaskDetailModal will handle the actual claim logic
      }}
    />
  );
};

export default TaskDetailModalWrapper;