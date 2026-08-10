import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { VALID_CATEGORIES, VERIFICATION_MODES, VERIFICATION_MODE_LABELS } from '../../constants/tasks';

interface MarketplaceFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedVerification: string;
  onVerificationChange: (value: string) => void;
  sortBy: 'newest' | 'reward' | 'progress';
  onSortByChange: (value: 'newest' | 'reward' | 'progress') => void;
}

const selectClass =
  "px-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white text-sm focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all appearance-none bg-no-repeat bg-right pr-10";

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundSize: '12px',
  backgroundPosition: 'right 12px center',
} as const;

export const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onCategoryChange,
  selectedVerification,
  onVerificationChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="liquid-glass rounded-3xl p-4 md:p-6 border border-white/10 mb-8 backdrop-blur-xl bg-black/40"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#111113] border border-white/10 text-white placeholder-white/40 focus:border-[#836EF9] focus:outline-none focus:ring-1 focus:ring-[#836EF9] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="All">All Categories</option>
            {VALID_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedVerification}
            onChange={(e) => onVerificationChange(e.target.value)}
            className={selectClass}
            style={selectStyle}
          >
            <option value="All">All Verification</option>
            {VERIFICATION_MODES.map((mode) => (
              <option key={mode} value={mode}>{VERIFICATION_MODE_LABELS[mode]}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'newest' | 'reward' | 'progress')}
            className={selectClass}
            style={selectStyle}
          >
            <option value="newest">Newest First</option>
            <option value="reward">Highest Reward</option>
            <option value="progress">Most Progress</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};
