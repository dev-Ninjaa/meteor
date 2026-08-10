import type { TaskCategory, VerificationMode } from '../types';

export const VALID_CATEGORIES: TaskCategory[] = [
  'AI Verification',
  'Code Debugging',
  'Design Feedback',
  'Translation',
  'Local Knowledge',
  'Data Labeling',
];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  'AI Verification': 'AI Verification',
  'Code Debugging': 'Code Debugging',
  'Design Feedback': 'Design Feedback',
  'Translation': 'Translation',
  'Local Knowledge': 'Local Knowledge',
  'Data Labeling': 'Data Labeling',
};

export const VERIFICATION_MODES: VerificationMode[] = ['AI', 'MANUAL', 'BOTH'];

export const VERIFICATION_MODE_LABELS: Record<VerificationMode, string> = {
  AI: 'AI Verification',
  MANUAL: 'Human Review',
  BOTH: 'Hybrid',
};
