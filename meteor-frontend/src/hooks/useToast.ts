import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  variant: 'default' | 'success' | 'destructive'
  dismiss: () => void
}

interface ToastState {
  toasts: Toast[]
  toast: (message: string, variant?: Toast['variant']) => string
  dismiss: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  toast: (message, variant = 'default') => {
    const id = Math.random().toString(36).slice(2, 10)
    const dismiss = () => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    set((state) => ({ toasts: [...state.toasts, { id, message, variant, dismiss }] }))
    setTimeout(dismiss, 5000)
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))