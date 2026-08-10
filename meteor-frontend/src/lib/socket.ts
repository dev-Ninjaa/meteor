// Socket.IO client for real-time updates
import { io, Socket } from 'socket.io-client';
import type { Notification, Task, Submission } from '../types';

type WsEventMap = {
  'task.created': Task;
  'task.updated': Partial<Task> & { taskId: string };
  'task.published': { taskId: string; title: string; createdById: string; status: string };
  'task.cancelled': { taskId: string; title: string; createdById: string; status: string };
  'task.joined': { taskId: string; userId: string; workerId: string };
  'task.left': { taskId: string; userId: string; workerId: string };
  'submission.created': { taskId: string; submissionId: string; workerId: string };
  'submission.approved': { taskId: string; submissionId: string; workerId: string; status: string };
  'submission.rejected': { taskId: string; submissionId: string; workerId: string; status: string };
  'verification.completed': { taskId: string; submissionId: string; workerId: string; status: string; mode: 'AI' | 'MANUAL' };
  'escrow.locked': { taskId: string; userId: string; amount: string; txHash: string };
  'escrow.released': { taskId: string; userId: string; submissionId: string; txHash: string };
  'escrow.refunded': { taskId: string; userId: string; txHash: string; reason: string };
  'notification.created': { userId: string; notification: Notification };
  'connected': null;
  'disconnected': string;
};

type EventCallback<T> = (data: T) => void;

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect = (token: string) => {
    if (this.socket?.connected) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
      this.emit('connected', null);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Register all event handlers
    const events = [
      'task.created', 'task.updated', 'task.published', 'task.cancelled',
      'task.joined', 'task.left',
      'submission.created', 'submission.approved', 'submission.rejected',
      'verification.completed',
      'escrow.locked', 'escrow.released', 'escrow.refunded',
      'notification.created'
    ] as const;

    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        this.emit(event, data);
      });
    });
  }

  disconnect = () => {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Room subscriptions
  subscribeToUser = (userId: string) => {
    this.socket?.emit('subscribe:user', userId);
  }

  unsubscribeFromUser = (userId: string) => {
    this.socket?.emit('unsubscribe:user', userId);
  }

  subscribeToTask = (taskId: string) => {
    this.socket?.emit('subscribe:task', taskId);
  }

  unsubscribeFromTask = (taskId: string) => {
    this.socket?.emit('unsubscribe:task', taskId);
  }

  // Event listener management
  on = <K extends keyof WsEventMap>(event: K, callback: EventCallback<WsEventMap[K]>) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off = <K extends keyof WsEventMap>(event: K, callback: EventCallback<WsEventMap[K]>) => {
    this.listeners.get(event)?.delete(callback);
  }

  private emit = (event: string, data: any) => {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export const socket = new SocketClient();
