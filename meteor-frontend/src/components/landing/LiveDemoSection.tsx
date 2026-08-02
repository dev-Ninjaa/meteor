import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BlurText } from '../shared/BlurText';
import { useAppStore } from '../../store/useAppStore';
import { Play, Sparkles, ShieldCheck, ArrowUpRight, Zap, RefreshCw, Cpu, DollarSign } from 'lucide-react';

export const LiveDemoSection: React.FC = () => {
  const { setActiveTab, monBalance } = useAppStore();
  const [promptText, setPromptText] = useState('Audit Claude 3.7 Output for Hallucination in Legal Contract');
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState<'idle' | 'decomposing' | 'created' | 'joined' | 'verifying' | 'completed'>('idle');
  const [demoLog, setDemoLog] = useState<string[]>([]);

  const handleRunDemo = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStep('decomposing');
    setDemoLog(['AI Engine received task request...']);

    // Step 1: Decomposing (800ms)
    await new Promise((r) => setTimeout(r, 800));
    setStep('created');
    setDemoLog((prev) => [...prev, 'Locked 45.0 MON in Smart Contract on Monad Testnet', 'Task published to global swarm']);

    // Step 2: Worker Joins (1000ms)
    await new Promise((r) => setTimeout(r, 1000));
    setStep('joined');
    setDemoLog((prev) => [...prev, 'Human Worker 0x71C...9B41 accepted task', 'Submission payload uploaded to IPFS/Swarm']);

    // Step 3: AI Verification (1000ms)
    await new Promise((r) => setTimeout(r, 1000));
    setStep('verifying');
    setDemoLog((prev) => [...prev, 'Running dual AI consensus verification score...']);

    // Step 4: Completed (1000ms)
    await new Promise((r) => setTimeout(r, 1000));
    setStep('completed');
    setDemoLog((prev) => [...prev, 'AI Audit: 100% PASS', 'Released 45.0 MON to worker wallet (tx: 0x8f2a...91e4)']);

    setIsSimulating(false);
  };

  const handleReset = () => {
    setStep('idle');
    setDemoLog([]);
    setIsSimulating(false);
  };

  return (
    <section className="relative py-28 px-6 bg-[#09090B] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#836EF9]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-[#836EF9]/30 text-xs font-mono text-[#836EF9] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Section 07 // Live Interactive MVP Engine
          </div>
          <BlurText
            text="Experience the Programmable Task Lifecycle"
            className="font-heading italic text-4xl sm:text-6xl text-white tracking-tight leading-tight"
          />
          <p className="text-sm sm:text-base text-white/60 mt-3 max-w-xl mx-auto">
            Test how natural prompt input automatically decomposes, dispatches to human workers, and settles instantly on Monad.
          </p>
        </div>

        {/* Embedded Interactive Shell */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-2xl bg-black/80">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-white/60">meteor-engine://live-simulation</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-white/40">Monad Balance:</span>
              <span className="text-[#836EF9] font-bold">{monBalance.toFixed(1)} MON</span>
            </div>
          </div>

          {/* Prompt Creator Box */}
          <div className="mt-6">
            <label className="text-xs font-mono text-white/50 mb-2 block uppercase tracking-wider">
              1. Enter Task Prompt
            </label>
            <div className="relative">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="What do you need done by humans & AI?"
                disabled={isSimulating}
                className="w-full bg-[#111113] border border-white/15 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all"
              />
              <button
                onClick={handleRunDemo}
                disabled={isSimulating}
                className="absolute right-2 top-2 bottom-2 bg-white text-black font-semibold px-5 rounded-xl text-xs hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#836EF9]" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Simulate Task</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[11px] font-mono text-white/40">Presets:</span>
            {
              [
                'Audit Claude 3.7 Output for Hallucination in Legal Contract',
                'Verify Tokyo Storefront Hours & Photos',
                'Debug Rust Async Mutex Lock Crash',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(preset)}
                  disabled={isSimulating}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                >
                  {preset.slice(0, 28)}...
                </button>
              ))
            }
          </div>

          {/* Interactive Flow Visualizer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                step === 'decomposing'
                  ? 'bg-[#836EF9]/10 border-[#836EF9] text-white shadow-lg shadow-[#836EF9]/10'
                  : step !== 'idle'
                  ? 'bg-white/5 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-4 h-4 text-[#836EF9]" />
                <span className="text-[10px] font-mono">STEP 1</span>
              </div>
              <div className="text-xs font-semibold">AI Decomposition</div>
              <div className="text-[11px] text-white/60 mt-1">Parses prompt & escrows MON</div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                step === 'created' || step === 'joined'
                  ? 'bg-[#836EF9]/10 border-[#836EF9] text-white shadow-lg shadow-[#836EF9]/10'
                  : step === 'verifying' || step === 'completed'
                  ? 'bg-white/5 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-mono">STEP 2</span>
              </div>
              <div className="text-xs font-semibold">Global Swarm Route</div>
              <div className="text-[11px] text-white/60 mt-1">Worker accepts task</div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                step === 'verifying'
                  ? 'bg-[#836EF9]/10 border-[#836EF9] text-white shadow-lg shadow-[#836EF9]/10'
                  : step === 'completed'
                  ? 'bg-white/5 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck className="w-4 h-4 text-[#836EF9]" />
                <span className="text-[10px] font-mono">STEP 3</span>
              </div>
              <div className="text-xs font-semibold">AI Audit Consensus</div>
              <div className="text-[11px] text-white/60 mt-1">Proof verified 100%</div>
            </div>

            {/* Step 4 */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                step === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-white/[0.02] border-white/10 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono">STEP 4</span>
              </div>
              <div className="text-xs font-semibold">Instant Monad Payout</div>
              <div className="text-[11px] text-white/60 mt-1">0.42s finality</div>
            </div>
          </div>

          {/* Console Log Output */}
          {demoLog.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs text-white/80 space-y-1.5">
              <div className="text-white/40 pb-2 border-b border-white/10 flex items-center justify-between">
                <span>SYSTEM CONSOLE LOG</span>
                {step === 'completed' && (
                  <button onClick={handleReset} className="text-xs text-[#836EF9] hover:underline">
                    Clear & Run Again
                  </button>
                )}
              </div>
              {demoLog.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span className="text-white/90">{log}</span>
                </div>
              ))}
            </div>
          )}

          {/* Try MVP Banner */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-white/70">
              Ready to explore all open microtasks or publish your own prompt?
            </div>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="bg-white text-black font-semibold text-xs rounded-full px-6 py-2.5 flex items-center gap-2 hover:bg-white/90 transition-all hover:scale-105"
            >
              <span>Launch Marketplace App</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};