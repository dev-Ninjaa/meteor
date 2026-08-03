import React from 'react';
import { useMe, useUpdateMe } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/useToast';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FadingVideo } from '../../components/shared/FadingVideo';
import {
  ShieldCheck,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  GitCommit,
  Flame,
  UserCheck,
  Award as Trophy,
  GitCommit as GitCommitIcon,
  AlertCircle,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { data: user, isLoading: userLoading, error: userError, refetch } = useMe();
  const updateMe = useUpdateMe();
  const { toast } = useToast();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const displayAddress = user?.walletAddress || wagmiAddress || '';

    // Show toast on error but don't block UI - only show once per error
    const errorToastShown = useRef(false);
    React.useEffect(() => {
      if (userError && !userLoading && !errorToastShown.current) {
        errorToastShown.current = true;
        toast('Profile load failed - using wallet address. Some features may be limited.', 'destructive');
      } else if (!userError) {
        errorToastShown.current = false;
      }
    }, [userError, userLoading]);

    // Always show loading briefly, then render UI with whatever data we have
  if (userLoading && !displayAddress) {
    return (
      <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#836EF9] border-t-transparent mx-auto mb-4" />
          <p className="text-white/60 font-mono text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white pt-28 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Background Video (full bleed) with custom JS crossfade */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-20 filter blur-md scale-105 pointer-events-none"
      />

      {/* Heavy Dark Overlay & Blur */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-0 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="liquid-glass rounded-3xl p-8 border border-white/15 mb-8 relative overflow-hidden backdrop-blur-xl bg-black/40 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#836EF9] to-indigo-500 flex items-center justify-center text-black font-bold font-mono text-xl shadow-xl border-2 border-white">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'MN'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white font-mono">
                  {displayAddress ? formatAddress(displayAddress) : 'Not connected'}
                </h1>
                {displayAddress && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                    {user ? 'Verified Expert Node' : 'Wallet Connected'}
                  </span>
                )}
                {userError && displayAddress && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Limited Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60 mt-1 font-light">
                {user?.bio || 'Programmable Human Intelligence Worker & AI Verification Specialist'}
              </p>

              {/* GitHub-style key metrics bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10 text-xs font-mono">
                <div>
                  <div className="text-white/40">Completion Rate</div>
                  <div className="text-lg font-bold text-emerald-400">{user ? '99.8%' : '—'}</div>
                </div>
                <div>
                  <div className="text-white/40">Verification Accuracy</div>
                  <div className="text-lg font-bold text-[#836EF9]">{user ? '100%' : '—'}</div>
                </div>
                <div>
                  <div className="text-white/40">Tasks Solved</div>
                  <div className="text-lg font-bold text-white">{user ? '48' : '—'}</div>
                </div>
                <div>
                  <div className="text-white/40">Reputation</div>
                  <div className="text-lg font-bold text-indigo-400">{user?.reputation || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GitHub-Style Contribution / Verification Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="liquid-glass rounded-3xl p-6 border border-white/15 mb-8 backdrop-blur-xl bg-black/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading italic text-2xl text-white flex items-center gap-2">
              <GitCommitIcon className="w-5 h-5 text-[#836EF9]" /> Verification Activity Heatmap
            </h3>
            <span className="text-xs font-mono text-white/50">48 verifications in last 30 days</span>
          </div>

          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 pt-2">
            {Array.from({ length: 48 }, (_, i) => ({
              count: Math.floor(Math.random() * 5),
              day: i,
            })).map((item, idx) => (
              <div
                key={idx}
                title={`${item.count} verifications on Day ${item.day + 1}`}
                className={`h-4 rounded-md transition-all ${
                  item.count === 0
                    ? 'bg-white/5'
                    : item.count === 1
                    ? 'bg-[#836EF9]/30'
                    : item.count === 2
                    ? 'bg-[#836EF9]/60'
                    : 'bg-[#836EF9] shadow-lg shadow-[#836EF9]/40'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Achievements & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Natural Earned Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40"
          >
            <h3 className="font-heading italic text-2xl text-white mb-4">Earned Protocol Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Top Tester</div>
                  <div className="text-[10px] font-mono text-white/40">Quality</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#836EF9]" />
                <div>
                  <div className="text-xs font-semibold text-white">Bug Hunter</div>
                  <div className="text-[10px] font-mono text-white/40">Code Debugging</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <Star className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Translator</div>
                  <div className="text-[10px] font-mono text-white/40">Localization</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Fast Responder</div>
                  <div className="text-[10px] font-mono text-white/40">Sub-Second</div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Verified Expert</div>
                  <div className="text-[10px] font-mono text-white/40">AI Red-Teaming</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Verified Skill Vectors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="liquid-glass rounded-3xl p-6 border border-white/10 backdrop-blur-xl bg-black/40"
          >
            <h3 className="font-heading italic text-2xl text-white mb-4">Verified Skill Vectors</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'AI Red-Teaming & Hallucination Audit',
                'Rust Async Mutex Locks',
                'Japanese Localization & Idioms',
                'California Civil Code § 1668 Compliance',
                'Satellite Thermal Imagery Annotation',
                'Monad Smart Contract Audit',
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-white/80"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
            
            {/* Profile Settings */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="font-heading italic text-xl text-white mb-4">Profile Settings</h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await updateMe.mutateAsync({
                    bio: formData.get('bio') as string,
                  });
                  toast('Profile updated - your bio has been saved.', 'success');
                } catch (err) {
                  toast('Update failed - could not save bio. Please try again.', 'destructive');
                }
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-white/50 mb-1 block uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    defaultValue={user?.bio || ''}
                    placeholder="Tell others about your skills and experience..."
                    className="w-full bg-[#111113] border border-white/15 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none font-mono"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={updateMe.isPending}
                  className="w-full py-3 rounded-2xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {updateMe.isPending ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};