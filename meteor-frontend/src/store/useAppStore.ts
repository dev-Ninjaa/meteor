import { create } from 'zustand';
import { TaskItem, TransactionItem, INITIAL_TASKS, INITIAL_TRANSACTIONS, SubmissionType, VerificationType } from '../data/mockData';
import confetti from 'canvas-confetti';

export type AppTab = 'landing' | 'marketplace' | 'dashboard' | 'wallet' | 'profile';

interface AppState {
  // Navigation & View
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Tasks Data
  tasks: TaskItem[];
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

  // Wallet
  isConnected: boolean;
  walletAddress: string;
  monBalance: number;
  connectWallet: () => void;
  disconnectWallet: () => void;

  // Transactions
  transactions: TransactionItem[];

  // Actions
  createTask: (newTask: Partial<TaskItem>) => TaskItem;
  acceptAndCompleteTask: (taskId: string, submissionData: any) => Promise<boolean>;

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

  tasks: INITIAL_TASKS,
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

  isConnected: true,
  walletAddress: '0x71C...9B41',
  monBalance: 425.50,

  connectWallet: () => {
    set({ isConnected: true });
    get().addToast('Wallet Connected', 'Connected to Monad Testnet (Chain ID 10143)', 'monad');
  },
  disconnectWallet: () => {
    set({ isConnected: false });
    get().addToast('Wallet Disconnected', 'Disconnected from Monad network', 'info');
  },

  transactions: INITIAL_TRANSACTIONS,

  createTask: (newTaskData) => {
    const id = `task-${Date.now().toString().slice(-4)}`;
    const rewardNum = newTaskData.rewardNum || 35.0;
    const newTask: TaskItem = {
      id,
      title: newTaskData.title || 'Untitled Microtask',
      description: newTaskData.description || '',
      instructions: newTaskData.instructions || 'Follow verification guidelines.',
      requirements: newTaskData.requirements || 'Standard quality output',
      reward: `${rewardNum.toFixed(1)} MON`,
      rewardNum,
      duration: newTaskData.duration || '10 mins',
      workersRequired: newTaskData.workersRequired || 5,
      workersJoined: 0,
      workersCompleted: 0,
      category: newTaskData.category || 'AI Verification',
      difficulty: newTaskData.difficulty || 'Medium',
      creator: '0x71C...9B41 (You)',
      status: 'PUBLISHED',
      submissionType: newTaskData.submissionType || 'text',
      verificationType: newTaskData.verificationType || 'AI Verification',
      options: newTaskData.options || [],
      createdAt: 'Just now',
    };

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      type: 'Task Escrow',
      amount: `-${newTask.reward}`,
      taskTitle: newTask.title,
      status: 'CONFIRMED',
      timestamp: 'Just now',
      taskId: id,
    };

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      transactions: [newTx, ...state.transactions],
      monBalance: Math.max(0, state.monBalance - rewardNum),
    }));

    get().addToast('Task Published & Escrowed', `Created "${newTask.title}" — ${newTask.reward} locked on Monad`, 'monad');
    return newTask;
  },

  acceptAndCompleteTask: async (taskId, submissionData) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return false;

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#836EF9', '#A000FF', '#FAFAFA', '#6E56F8'],
    });

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      type: 'Task Reward',
      amount: `+${task.reward}`,
      taskTitle: task.title,
      status: 'CONFIRMED',
      timestamp: 'Just now',
      taskId: task.id,
    };

    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id === taskId) {
          const newJoined = Math.min(t.workersJoined + 1, t.workersRequired);
          const newCompleted = Math.min(t.workersCompleted + 1, t.workersRequired);
          const newStatus = newCompleted >= t.workersRequired ? 'COMPLETED' : 'VERIFIED';
          return {
            ...t,
            workersJoined: newJoined,
            workersCompleted: newCompleted,
            status: newStatus,
            userSubmission: submissionData,
          };
        }
        return t;
      }),
      transactions: [newTx, ...state.transactions],
      monBalance: state.monBalance + task.rewardNum,
    }));

    get().addToast(
      'Task Solved & Verified!',
      `${task.verificationType} confirmed. Released ${task.reward} to your wallet.`,
      'success'
    );
    return true;
  },

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
