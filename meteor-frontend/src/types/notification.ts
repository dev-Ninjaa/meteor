// Notification types
import type { Timestamp, PaginatedResponse, QueryParams } from './base';

export type NotificationType = 
  | 'TASK_PUBLISHED'
  | 'TASK_CANCELLED'
  | 'TASK_JOINED'
  | 'TASK_LEFT'
  | 'SUBMISSION_RECEIVED'
  | 'SUBMISSION_APPROVED'
  | 'SUBMISSION_REJECTED'
  | 'VERIFICATION_COMPLETED'
  | 'ESCROW_LOCKED'
  | 'ESCROW_RELEASED'
  | 'ESCROW_REFUNDED';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  senderId: string | null;
  receiverId: string;
  createdAt: Timestamp;
};

export type QueryNotificationsDto = QueryParams & {
  read?: boolean;
};

export type NotificationListResponse = PaginatedResponse<Notification>;