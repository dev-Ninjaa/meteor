'use client'

import { useToast } from '../../hooks/useToast'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in',
            toast.variant === 'destructive' && 'bg-red-500/10 border-red-500/30 text-red-400',
            toast.variant === 'success' && 'bg-green-500/10 border-green-500/30 text-green-400',
            toast.variant === 'default' && 'bg-slate-800/90 border-slate-700 text-slate-100'
          )}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => toast.dismiss()}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}