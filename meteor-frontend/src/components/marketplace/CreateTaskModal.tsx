import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { useTasks, useCreateTask, usePublishTask } from '@/hooks/useTasks';
import { useGenerateTask } from '@/hooks/useAI';
import { usePayments } from '@/hooks/usePayments';
import { useAppStore } from '../../store/useAppStore';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useTaskForm, usePublishFlow } from './useTaskForm';
import { TaskFormFields } from './TaskFormFields';
import { AIGenerateSection } from './AIGenerateSection';
import { AdvancedSettings } from './AdvancedSettings';
import { FormActions } from './FormActions';
import { EscrowLockModal } from './EscrowLockModal';

export const CreateTaskModal: React.FC = () => {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    escrowLockData, 
    setEscrowLockData 
  } = useAppStore();
  const createTaskMutation = useCreateTask();
  const publishTaskMutation = usePublishTask();
  const generateTaskMutation = useGenerateTask();
  const { createEscrow } = usePayments();

  const form = useTaskForm();
  const publishFlow = usePublishFlow({
    createTaskMutation,
    publishTaskMutation,
    form,
    generateTaskMutation,
    onEscrowData: setEscrowLockData,
    onClose: () => setIsCreateModalOpen(false),
  });

  if (!isCreateModalOpen && !escrowLockData) return null;

  return (
    <>
      {/* Create Task Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <ModalWrapper
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create Swarm Task"
            subtitle="ChatGPT-Style Prompt to Monad Smart Contract"
          >
            <form onSubmit={publishFlow.handleSubmit} className="mt-6 space-y-6">
              <AIGenerateSection
                prompt={form.prompt}
                onPromptChange={(value: string) => form.setField('prompt', value)}
                onGenerate={publishFlow.handleAiGenerate}
                isAnalyzing={publishFlow.isAiAnalyzing}
              />

              <TaskFormFields
                form={form}
              />

              <AdvancedSettings
                autoPay={form.autoPay}
                setAutoPay={(value: boolean) => form.setField('autoPay', value)}
                consensusThreshold={form.consensusThreshold}
                setConsensusThreshold={(value: string) => form.setField('consensusThreshold', value)}
                visibility={form.visibility}
                setVisibility={(value: 'Public' | 'Private') => form.setField('visibility', value)}
              />

              <FormActions
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={publishFlow.handleSubmit}
                isPending={publishFlow.isPending}
              />
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Escrow Lock Modal - Separate Component */}
      <EscrowLockModal
        data={escrowLockData}
        isOpen={!!escrowLockData}
        onClose={() => setEscrowLockData(null)}
      />
    </>
  );
}