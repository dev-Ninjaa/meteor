import { create } from 'zustand';
import { TaskItem, TransactionItem, INITIAL_TASKS, INITIAL_TRANSACTIONS } from '../data/mockData';
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
  createTask: (newTask: Omit<TaskItem, 'id' | 'createdAt' | 'status' | 'workersJoined'>) => TaskItem;
  acceptAndCompleteTask: (taskId: string, submissionText: string) => Promise<boolean>;

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
    const newTask: TaskItem = {
      ...newTaskData,
      id,
      createdAt: 'Just now',
      status: 'OPEN',
      workersJoined: 0,
    };

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      type: 'Task Escrow',
      amount: `-${newTaskData.reward}`,
      status: 'CONFIRMED',
      timestamp: 'Just now',
      taskId: id,
    };

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      transactions: [newTx, ...state.transactions],
      monBalance: Math.max(0, state.monBalance - newTaskData.rewardNum),
    }));

    get().addToast('Task Escrowed on Monad', `Created "${newTaskData.title}" — ${newTaskData.reward} locked in smart contract`, 'monad');
    return newTask;
  },

  acceptAndCompleteTask: async (taskId, _submissionText) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return false;

    // Simulate AI verification latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Confetti effect
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
      status: 'CONFIRMED',
      timestamp: 'Just now',
      taskId: task.id,
    };

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              workersJoined: Math.min(t.workersJoined + 1, t.workersRequired),
              workersCompleted: (t.workersJoined + 1),
              status: t.workersJoined + 1 >= t.workersRequired ? 'COMPLETED' : 'IN_PROGRESS',
            }
          : t
      ),
      transactions: [newTx, ...state.transactions],
      monBalance: state.monBalance + task.rewardNum,
    }));

    get().addToast('Task Solved & Verified!', `AI Verified 100%. Released ${task.reward} instantly to your wallet.`, 'success');
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
