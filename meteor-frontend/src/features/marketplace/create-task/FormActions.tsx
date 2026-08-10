import { ArrowRight, ShieldCheck } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function FormActions({ onCancel, onSubmit, isPending }: FormActionsProps) {
  return (
    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
      <div className="text-xs text-white/50 font-mono flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Monad Smart Contract Escrow Lock</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-white text-black font-semibold text-xs rounded-full px-6 py-3 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="animate-spin">⟳</span>
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <span>Publish Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}