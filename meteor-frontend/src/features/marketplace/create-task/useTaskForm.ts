import { useState, useCallback } from 'react';
import { useGenerateTask } from '../../../hooks/useAI';
import { useCreateTask, usePublishTask } from '../../../hooks/useTasks';
import { TaskCategory, SubmissionType, VerificationType } from '../../../types';

export interface TaskFormState {
  prompt: string;
  title: string;
  description: string;
  reward: string;
  workers: string;
  duration: string;
  category: TaskCategory;
  submissionType: SubmissionType;
  submissionOptions: string[];
  verificationType: VerificationType;
  autoPay: boolean;
  consensusThreshold: string;
  visibility: 'Public' | 'Private';
  attachments: any[];
}

export function useTaskForm() {
  const [form, setForm] = useState<TaskFormState>({
    prompt: '',
    title: '',
    description: '',
    reward: '35.0',
    workers: '10',
    duration: '10 mins',
    category: 'AI Verification',
    submissionType: 'text',
    submissionOptions: [],
    verificationType: 'AI Verification',
    autoPay: true,
    consensusThreshold: '85%',
    visibility: 'Public',
    attachments: [],
  });

  const setField = useCallback(<K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return { ...form, setField };
}

export function usePublishFlow({
  createTaskMutation,
  publishTaskMutation,
  form,
  generateTaskMutation,
  onEscrowData,
  onClose,
}: {
  createTaskMutation: ReturnType<typeof import('@/hooks/useTasks').useCreateTask>;
  publishTaskMutation: ReturnType<typeof import('@/hooks/useTasks').usePublishTask>;
  form: ReturnType<typeof useTaskForm>;
  generateTaskMutation: ReturnType<typeof import('@/hooks/useAI').useGenerateTask>;
  onEscrowData: (data: any) => void;
  onClose: () => void;
}) {
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const handleAiGenerate = useCallback(async () => {
    if (!form.prompt.trim()) return;
    setIsAiAnalyzing(true);

    try {
      const response = await generateTaskMutation.mutateAsync({
        prompt: form.prompt,
        category: form.category,
      });
      const suggestion = response.data;

      // Apply AI suggestions to form
      if (suggestion.title) form.setField('title', suggestion.title);
      if (suggestion.description) form.setField('description', suggestion.description);
      if (suggestion.reward) form.setField('reward', String(suggestion.reward));
      if (suggestion.workersRequired) form.setField('workers', String(suggestion.workersRequired));
      if (suggestion.category) form.setField('category', suggestion.category as any);
      if (suggestion.submissionType) form.setField('submissionType', suggestion.submissionType as any);
      if (suggestion.verificationMode) {
        const modeMap: Record<string, any> = {
          'AI': 'AI Verification',
          'MANUAL': 'Creator Review',
          'BOTH': 'Hybrid',
        };
        form.setField('verificationType', modeMap[suggestion.verificationMode] || 'AI Verification');
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  }, [form, generateTaskMutation]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title && !form.prompt) return;

    createTaskMutation.mutate(
      {
        title: form.title || form.prompt,
        description: form.description || form.prompt,
        reward: form.reward,
        deadline: undefined,
        tags: [form.category],
        workersRequired: parseInt(form.workers, 10) || 5,
        maxWorkers: parseInt(form.workers, 10) || 5,
        verificationMode: form.verificationType === 'AI Verification' ? 'AI' : form.verificationType === 'Creator Review' ? 'MANUAL' : 'BOTH',
        submissionType: form.submissionType,
        submissionOptions: form.submissionOptions || [],
        allowAiVerification: true,
        manualVerificationRequired: form.verificationType === 'Creator Review',
        tokenAddress: undefined,
        attachments: form.attachments || [],
      },
      {
        onSuccess: (createdTask) => {
          publishTaskMutation.mutate(createdTask.id, {
            onSuccess: (publishedTask) => {
              if ((publishedTask as any).escrowData) {
                onEscrowData((publishedTask as any).escrowData);
              }
            },
          });
        },
      }
    );
    onClose();
  }, [createTaskMutation, publishTaskMutation, form, onEscrowData, onClose]);

  return {
    handleAiGenerate,
    handleSubmit,
    isAiAnalyzing,
    isPending: createTaskMutation.isPending || publishTaskMutation.isPending,
  };
}