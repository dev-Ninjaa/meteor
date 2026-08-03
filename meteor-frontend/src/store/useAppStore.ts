import { create } from 'zustand';
import { TaskItem, TransactionItem } from '../types/task';

export type AppTab = 'landing' | 'marketplace' | 'dashboard' | 'wallet' | 'profile';

interface AppState {
  // Navigation & View
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Tasks Data (UI filters only - real data comes from API hooks)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubmissionType: string;
  setSelectedSubmissionType: (type: string) => void;
  selectedVerificationType: string;
  setSelectedVerificationType: (type: string) => void;

  // Selected Task / Modals
  selectedTask: TaskItem | null;
  setSelectedTask: (task: TaskItem | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSolveModalOpen: boolean;
  setIsSolveModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;

  // Manual Verification Modal (for creators)
  manualVerificationData: {
    submissionId: string;
    taskId: string;
    taskTitle: string;
    submissionContent: string;
    reward: string;
  } | null;
  setManualVerificationData: (data: any) => void;
  isManualVerifyModalOpen: boolean;
  setIsManualVerifyModalOpen: (open: boolean) => void;

  // Escrow Lock Modal
  escrowLockData: {
    taskId: string;
    rewardPerWorker: string;
    maxWorkers: number;
    totalAmount: string;
    escrowContractAddress: string;
  } | null;
  setEscrowLockData: (data: any) => void;
  isLockingEscrow: boolean;
  setIsLockingEscrow: (v: boolean) => void;

  // Wallet (synced with wagmi)
  isConnected: boolean;
  walletAddress: string;
  monBalance: number;
  userId: string | null;
  setWalletInfo: (info: { isConnected: boolean; address: string; balance: number; userId: string | null }) => void;
  setUserId: (id: string | null) => void;

  // Toast / Notifications
  toasts: { id: string; title: string; message: string; type: 'success' | 'info' | 'monad' }[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'monad') => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'landing',
  setActiveTab: (tab) => {
    set({ activeTab: tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Empty - real data from useMarketplace/useTasks hooks
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: 'All',
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  selectedSubmissionType: 'All',
  setSelectedSubmissionType: (type) => set({ selectedSubmissionType: type }),
  selectedVerificationType: 'All',
  setSelectedVerificationType: (type) => set({ selectedVerificationType: type }),

  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
  isCreateModalOpen: false,
  setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  isSolveModalOpen: false,
  setIsSolveModalOpen: (open) => set({ isSolveModalOpen: open }),
  isDetailModalOpen: false,
  setIsDetailModalOpen: (open) => set({ isDetailModalOpen: open }),

  // Manual Verification Modal (for creators)
  manualVerificationData: null,
  setManualVerificationData: (data) => set({ manualVerificationData: data }),
  isManualVerifyModalOpen: false,
  setIsManualVerifyModalOpen: (open) => set({ isManualVerifyModalOpen: open }),

  // Escrow Lock Modal
  escrowLockData: null,
  setEscrowLockData: (data) => set({ escrowLockData: data }),
  isLockingEscrow: false,
  setIsLockingEscrow: (v: boolean) => set({ isLockingEscrow: v }),

  // Wallet
  isConnected: false,
  walletAddress: '',
  monBalance: 0,
  userId: null,
  setWalletInfo: (info) => set(info),
  setUserId: (id) => set({ userId: id }),

  toasts: [],
  addToast: (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, title, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));