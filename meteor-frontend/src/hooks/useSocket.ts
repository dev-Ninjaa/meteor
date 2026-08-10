import { useEffect, useRef, useState, useMemo } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from './useAuth';

export function useSocket() {
  const { getToken } = useAuth();
  const initialized = useRef(false);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connected', onConnect);
    socket.on('disconnected', onDisconnect);
    return () => {
      socket.off('connected', onConnect);
      socket.off('disconnected', onDisconnect);
    };
  }, []);

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

  return useMemo(
    () => ({
      ...socket,
      connected,
    }),
    [connected],
  );
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

export function useNotificationEvents(userId: string | null) {
  const { subscribeToUser, unsubscribeFromUser, on, off, connected } = useSocket();

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
