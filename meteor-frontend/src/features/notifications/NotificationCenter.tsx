import React, { useEffect } from 'react';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkRead, 
  useMarkAllRead, 
  useDeleteNotification 
} from '@/hooks/useNotifications';
import { useNotificationEvents } from '@/hooks/useSocket';
import { useAuth, useMe } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCircle2, Clock, Zap, Users, AlertCircle, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  task_created: Zap,
  task_updated: Clock,
  task_published: Zap,
  task_cancelled: AlertCircle,
  task_joined: Users,
  task_left: Users,
  submission_created: MessageSquare,
  submission_approved: CheckCircle2,
  submission_rejected: AlertCircle,
  verification_completed: ShieldCheck,
  escrow_locked: Zap,
  escrow_released: CheckCircle2,
  escrow_refunded: AlertCircle,
  default: Bell,
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { getToken } = useAuth();
  const hasToken = !!getToken();
  const { data: currentUser } = useMe({ enabled: hasToken });
  const { data: notificationsData, refetch } = useNotifications(undefined, { enabled: hasToken });
  const { data: unreadCountData, refetch: refetchCount } = useUnreadCount({ enabled: hasToken });
  
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();
  
  const { onNotification } = useNotificationEvents(currentUser?.id ?? null);
  
  const notifications = notificationsData?.data || [];
  const unreadCount = unreadCountData ?? 0;

  // Listen for new notifications
  useEffect(() => {
    const unsubscribe = onNotification(() => {
      refetch();
      refetchCount();
    });
    return unsubscribe;
  }, [onNotification, refetch, refetchCount]);

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      refetch();
      refetchCount();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      refetch();
      refetchCount();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
      refetchCount();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getIcon = (type: string) => {
    const Icon = ICON_MAP[type] || ICON_MAP.default;
    return <Icon className="w-4 h-4" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 pt-28 pointer-events-auto">
        <div className="w-full max-w-sm animate-in slide-in-from-right duration-200">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl border border-white/10 bg-black/95 text-white shadow-2xl overflow-hidden max-h-[calc(100vh-120px)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-[#836EF9]" />
                <div>
                  <h3 className="font-heading italic text-xl text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-mono text-emerald-400">{unreadCount} unread</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={markAllReadMutation.isPending}
                    className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/40">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-[10px] font-mono text-white/30 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification: any) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          !notification.read ? 'bg-[#836EF9]/20 text-[#836EF9]' : 'bg-white/5 text-white/50'
                        )}>
                          {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              'font-medium text-sm text-white',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] font-mono text-white/40 flex-shrink-0">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {notification.metadata?.taskId && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#836EF9] hover:underline cursor-pointer">
                                View Task
                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkRead(notification.id)}
                              disabled={markReadMutation.isPending}
                              className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded bg-emerald-500/10 disabled:opacity-50"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            disabled={deleteMutation.isPending}
                            className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/10 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationCenter;