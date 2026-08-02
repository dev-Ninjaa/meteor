// Shared enums/types used across the app - only types NOT defined in specific domain files

export type TaskCategory = 
  | 'AI Verification' 
  | 'Code Debugging' 
  | 'Design Feedback' 
  | 'Translation' 
  | 'Local Knowledge' 
  | 'Data Labeling';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type SubmissionType =
  | 'text'
  | 'multiple_choice'
  | 'rating'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'link'
  | 'checklist'
  | 'multi_field'
  | 'gps'
  | 'screen_recording';

export type VerificationType =
  | 'AI Verification'
  | 'Human Review'
  | 'AI First'
  | 'Consensus'
  | 'Creator Review'
  | 'Hybrid';

export type VerificationMode = 'AI' | 'MANUAL' | 'BOTH';

export type EscrowStatus = 'UNLOCKED' | 'LOCKED' | 'RELEASED' | 'REFUNDED';

export type TransactionType = 'Task Reward' | 'Task Escrow' | 'AI Audit Fee' | 'Refund';

export type TransactionStatus = 'CONFIRMED' | 'PENDING';