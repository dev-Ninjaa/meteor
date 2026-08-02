import { useEffect, useRef } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from './useAuth';

export function useSocket() {
  const { getToken } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    const token = getToken();
    if (token && !initialized.current) {
      socket.connect(token);
      initialized.current = true;
    } else if (!token && initialized.current) {
      socket.disconnect();
      initialized.current = false;
    }

    return () => {
      // Don't disconnect on unmount - keep socket alive across route changes
      // socket.disconnect();
    };
  }, [getToken]);

  return socket;
}

// Helper hooks for specific events
export function useTaskEvents(taskId: string | null) {
  const { subscribeToTask, unsubscribeFromTask, on, off, connected } = useSocket();

  useEffect(() => {
    if (!taskId || !connected) return;

    subscribeToTask(taskId);
    return () => unsubscribeFromTask(taskId);
  }, [taskId, connected, subscribeToTask, unsubscribeFromTask]);

  return {
    onTaskUpdated: (callback: (data: any) => void) => on('task.updated', callback),
    onTaskJoined: (callback: (data: any) => void) => on('task.joined', callback),
    onTaskLeft: (callback: (data: any) => void) => on('task.left', callback),
  };
}

export function useNotificationEvents() {
  const { subscribeToUser, unsubscribeFromUser, on, off, connected } = useSocket();
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!userId || !connected) return;

    subscribeToUser(userId);
    return () => unsubscribeFromUser(userId);
  }, [userId, connected, subscribeToUser, unsubscribeFromUser]);

  return {
    onNotification: (callback: (data: any) => void) => on('notification.created', callback),
  };
}

export function useEscrowEvents() {
  const { on, off, connected } = useSocket();

  return {
    onEscrowLocked: (callback: (data: any) => void) => on('escrow.locked', callback),
    onEscrowReleased: (callback: (data: any) => void) => on('escrow.released', callback),
    onEscrowRefunded: (callback: (data: any) => void) => on('escrow.refunded', callback),
  };
}

export function useSubmissionEvents() {
  const { on, off, connected } = useSocket();

  return {
    onSubmissionCreated: (callback: (data: any) => void) => on('submission.created', callback),
    onSubmissionApproved: (callback: (data: any) => void) => on('submission.approved', callback),
    onSubmissionRejected: (callback: (data: any) => void) => on('submission.rejected', callback),
  };
}

export function useVerificationEvents() {
  const { on, off, connected } = useSocket();

  return {
    onVerificationCompleted: (callback: (data: any) => void) => on('verification.completed', callback),
  };
}