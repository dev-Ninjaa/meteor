// Submission types
import type { Timestamp } from './base';

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VerificationStatus = 'PENDING' | 'PASSED' | 'FAILED';

export type Submission = {
  id: string;
  content: string;
  proof: string | null;
  status: SubmissionStatus;
  aiScore: number | null;
  aiFeedback: string | null;
  taskId: string;
  workerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verification?: Verification;
};

export type Verification = {
  id: string;
  status: VerificationStatus;
  aiScore: number | null;
  aiFeedback: string | null;
  manualNotes: string | null;
  isManual: boolean;
  verifiedById: string | null;
};

export type CreateSubmissionDto = {
  content: string;
  proof?: string;
};

export type ManualVerifyDto = {
  status: 'APPROVED' | 'REJECTED';
  manualNotes?: string;
};

export type AiVerifyResult = {
  passed: boolean;
  score: number;
  feedback: string;
};