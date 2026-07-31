import React from 'react';
import { Sparkles, ThumbsUp, AlertTriangle, Lightbulb, PieChart } from 'lucide-react';

interface AiSummaryCardProps {
  summary?: {
    overallSentiment: string;
    topFeedback: string[];
    commonProblems: string[];
    suggestions: string[];
    consensusScore: number;
  };
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 bg-black/40 backdrop-blur-xl mb-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#836EF9]/20 text-[#836EF9] flex items-center justify-center border border-[#836EF9]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading italic text-2xl text-white">AI Aggregated Task Synthesis</h3>
            <p className="text-xs font-mono text-white/50">Synthesized insights across swarm worker submissions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5" />
            Consensus: {summary.consensusScore}%
          </span>
          <span className="text-xs font-mono text-[#836EF9] bg-[#836EF9]/10 px-3 py-1 rounded-full border border-[#836EF9]/20 font-semibold">
            {summary.overallSentiment}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Positive Feedback */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
            <ThumbsUp className="w-4 h-4" /> Top Positive Consensus
          </div>
          <ul className="space-y-1.5 text-xs text-white/80 font-light">
            {summary.topFeedback.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Most Common Problems */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" /> Common Identified Issues
          </div>
          <ul className="space-y-1.5 text-xs text-white/80 font-light">
            {summary.commonProblems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#836EF9] font-semibold">
            <Lightbulb className="w-4 h-4" /> Recommended Actionables
          </div>
          <ul className="space-y-1.5 text-xs text-white/80 font-light">
            {summary.suggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#836EF9]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
