// AI types
import type { Timestamp } from './base';
import type { VerificationMode } from './task';

export type GenerateTaskDto = {
  prompt: string;
  category?: string;
};

export type VerifyTaskDto = {
  taskTitle: string;
  taskDescription: string;
  taskRequirements: string;
  submissionContent: string;
  submissionProof?: string;
};

export type AiVerificationResult = {
  passed: boolean;
  score: number;
  feedback: string;
};

export type AiTaskSuggestion = {
  title: string;
  description: string;
  reward: string;
  deadline: Timestamp;
  tags: string[];
  workersRequired: number;
  verificationMode: VerificationMode;
  category: string;
  maxWorkers: number;
  submissionType: string;
};