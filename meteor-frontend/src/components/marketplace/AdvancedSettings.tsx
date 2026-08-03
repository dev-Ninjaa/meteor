import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedSettingsProps {
  autoPay: boolean;
  setAutoPay: (v: boolean) => void;
  consensusThreshold: string;
  setConsensusThreshold: (v: string) => void;
  visibility: 'Public' | 'Private';
  setVisibility: (v: 'Public' | 'Private') => void;
}

export function AdvancedSettings({ autoPay, setAutoPay, consensusThreshold, setConsensusThreshold, visibility, setVisibility }: AdvancedSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between w-full text-xs font-mono text-white/60 hover:text-white transition-colors"
      >
        <span>Advanced Protocol Options</span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div>
            <label className="text-[11px] font-mono text-white/50 block mb-1">Consensus Threshold</label>
            <input
              type="text"
              value={consensusThreshold}
              onChange={(e) => setConsensusThreshold(e.target.value)}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-white/50 block mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'Public' | 'Private')}
              className="w-full bg-[#111113] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Public">Public Swarm</option>
              <option value="Private">Private Verified</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-mono text-white/50 block mb-1">Auto-Pay Escrow</label>
            <button
              type="button"
              onClick={() => setAutoPay(!autoPay)}
              className={`w-full py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                autoPay
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/5 text-white/60 border-white/10'
              }`}
            >
              {autoPay ? 'Enabled (Auto Escrow)' : 'Manual Release'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}