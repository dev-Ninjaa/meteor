import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Cpu, ShieldCheck, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SubmissionType, VerificationType } from '../../data/mockData';

export const CreateTaskModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createTask } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parsed & Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('35.0');
  const [workers, setWorkers] = useState('10');
  const [duration, setDuration] = useState('10 mins');
  const [category, setCategory] = useState<'AI Verification' | 'Code Debugging' | 'Design Feedback' | 'Translation' | 'Local Knowledge' | 'Data Labeling'>('AI Verification');
  const [submissionType, setSubmissionType] = useState<SubmissionType>('text');
  const [verificationType, setVerificationType] = useState<VerificationType>('AI Verification');

  // Advanced Collapsible Settings
  const [autoPay, setAutoPay] = useState(true);
  const [consensusThreshold, setConsensusThreshold] = useState('85%');
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');

  const handleAiParse = () => {
    if (!prompt.trim()) return;
    setIsAiAnalyzing(true);

    setTimeout(() => {
      const p = prompt.toLowerCase();
      setTitle(prompt.length > 55 ? prompt.slice(0, 52) + '...' : prompt);
      setDescription(`Auto-generated task spec from prompt: "${prompt}". Requires verified swarm intelligence execution.`);

      if (p.includes('review') || p.includes('landing page') || p.includes('design')) {
        setCategory('Design Feedback');
        setSubmissionType('rating');
        setVerificationType('Consensus');
        setWorkers('20');
        setReward('25.0');
      } else if (p.includes('tokyo') || p.includes('photo') || p.includes('location') || p.includes('store')) {
        setCategory('Local Knowledge');
        setSubmissionType('gps');
        setVerificationType('Human Review');
        setWorkers('5');
        setReward('80.0');
      } else if (p.includes('code') || p.includes('rust') || p.includes('bug')) {
        setCategory('Code Debugging');
        setSubmissionType('text');
        setVerificationType('AI Verification');
        setWorkers('3');
        setReward('120.0');
      } else {
        setCategory('AI Verification');
        setSubmissionType('text');
        setVerificationType('AI First');
        setWorkers('10');
        setReward('40.0');
      }

      setIsAiAnalyzing(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title && !prompt) return;

    createTask({
      title: title || prompt,
      description: description || prompt,
      rewardNum: parseFloat(reward) || 35.0,
      reward: `${reward} MON`,
      duration,
      workersRequired: parseInt(workers, 10) || 5,
      category,
      submissionType,
      verificationType,
      difficulty: 'Medium',
    });

    setIsCreateModalOpen(false);
    setPrompt('');
    setTitle('');
  };

  if (!isCreateModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="liquid-glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 bg-black/90 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#836EF9]/20 text-[#836EF9] flex items-center justify-center border border-[#836EF9]/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading italic text-2xl text-white">Create Swarm Task</h3>
                <p className="text-xs text-white/50 font-mono">ChatGPT-Style Prompt to Monad Smart Contract</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Natural Prompt Input - Primary Focused Prompt */}
            <div>
              <label className="text-xs font-mono text-[#836EF9] mb-2 block uppercase tracking-wider font-semibold">
                What do you need help with?
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g. "I need 20 people to review my landing page" or "Take photo of Tokyo store"'
                  className="w-full bg-[#111113] border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none"
                />
                <button
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiAnalyzing}
                  className="absolute right-3 bottom-3 text-xs bg-[#836EF9]/20 hover:bg-[#836EF9]/30 text-white px-3.5 py-1.5 rounded-xl border border-[#836EF9]/40 transition-all flex items-center gap-1.5 font-mono font-semibold"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#836EF9]" />
                  <span>{isAiAnalyzing ? 'Synthesizing Spec...' : 'Auto-Generate Task Spec'}</span>
                </button>
              </div>
            </div>

            {/* Editable Generated Task Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-white/60 mb-1 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">Reward per Worker (MON)</label>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">Number of Workers Needed</label>
                <input
                  type="number"
                  value={workers}
                  onChange={(e) => setWorkers(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">Submission Type</label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as any)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
                >
                  <option value="text">Text Response</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="rating">Rating (1-5 Stars)</option>
                  <option value="image">Image Upload</option>
                  <option value="gps">GPS / Location Photo</option>
                  <option value="screen_recording">Screen Recording</option>
                  <option value="checklist">Verification Checklist</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-white/60 mb-1 block">Verification Pipeline</label>
                <select
                  value={verificationType}
                  onChange={(e) => setVerificationType(e.target.value as any)}
                  className="w-full bg-[#111113] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#836EF9]"
                >
                  <option value="AI Verification">AI Verification</option>
                  <option value="Human Review">Human Review</option>
                  <option value="AI First">AI First Pipeline</option>
                  <option value="Consensus">Swarm Consensus</option>
                  <option value="Creator Review">Creator Review</option>
                  <option value="Hybrid">Hybrid (AI + Human)</option>
                </select>
              </div>
            </div>

            {/* Collapsible Advanced Settings */}
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
                      onChange={(e) => setVisibility(e.target.value as any)}
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

            {/* Submit Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-white/50 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Monad Smart Contract Escrow Lock</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white text-black font-semibold text-xs rounded-full px-6 py-3 hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
                >
                  <span>Publish Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
