import { useState } from 'react';
import { Cpu } from 'lucide-react';

interface AIGenerateSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isAnalyzing: boolean;
}

export function AIGenerateSection({ prompt, onPromptChange, onGenerate, isAnalyzing }: AIGenerateSectionProps) {
  return (
    <div>
      <label className="text-xs font-mono text-[#836EF9] mb-2 block uppercase tracking-wider font-semibold">
        What do you need help with?
      </label>
      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder='e.g. "I need 20 people to review my landing page" or "Take photo of Tokyo store"'
          className="w-full bg-[#111113] border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none"
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={isAnalyzing || !prompt.trim()}
          className="absolute right-3 bottom-3 text-xs bg-[#836EF9]/20 hover:bg-[#836EF9]/30 text-white px-3.5 py-1.5 rounded-xl border border-[#836EF9]/40 transition-all flex items-center gap-1.5 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Cpu className="w-3.5 h-3.5 text-[#836EF9]" />
          <span>{isAnalyzing ? 'Synthesizing Spec...' : 'Auto-Generate Task Spec'}</span>
        </button>
      </div>
    </div>
  );
}