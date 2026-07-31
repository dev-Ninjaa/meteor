import React, { useState } from 'react';
import { SubmissionType } from '../../data/mockData';
import {
  Type,
  CheckSquare,
  Star,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Link as LinkIcon,
  ListChecks,
  Sliders,
  MapPin,
  Camera,
  Upload
} from 'lucide-react';

interface SubmissionRendererProps {
  type: SubmissionType;
  options?: string[];
  onChange: (value: any) => void;
  value: any;
}

export const SubmissionRenderer: React.FC<SubmissionRendererProps> = ({
  type,
  options = [],
  onChange,
  value,
}) => {
  const [dragActive, setDragActive] = useState(false);

  switch (type) {
    case 'multiple_choice':
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block mb-2">
            Select Option ({options.length > 0 ? options.length : 3} Available)
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {(options.length > 0
              ? options
              : ['Option A: High Contrast Shield', 'Option B: Minimalist Typography', 'Option C: Abstract Node']
            ).map((opt, i) => (
              <button
                type="button"
                key={i}
                onClick={() => onChange(opt)}
                className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                  value === opt
                    ? 'bg-white text-black border-white font-semibold shadow-lg'
                    : 'liquid-glass text-white/80 border-white/10 hover:border-white/20'
                }`}
              >
                <span>{opt}</span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    value === opt ? 'border-black bg-black' : 'border-white/40'
                  }`}
                >
                  {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'rating':
      return (
        <div className="space-y-3">
          <label className="text-xs font-mono text-white/70 block">Overall Quality & UX Rating (1 - 5 Stars)</label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => onChange(star)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                  Number(value) >= star
                    ? 'bg-amber-400/10 text-amber-400 border-amber-400/40'
                    : 'liquid-glass text-white/40 border-white/10'
                }`}
              >
                <Star className={`w-6 h-6 ${Number(value) >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span className="text-[10px] font-mono">{star}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'gps':
      return (
        <div className="space-y-3">
          <label className="text-xs font-mono text-white/70 block">Location Tag & Storefront Verification</label>
          <div className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <MapPin className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">GPS Coordinate Tagged</div>
                <div className="text-[11px] font-mono text-white/50">Lat: 35.6620° N, Lon: 139.6980° E (Accuracy: ± 2m)</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <label className="text-[11px] font-mono text-white/60 mb-1.5 block">Upload On-Site Photo</label>
              <div className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center hover:border-white/30 transition-colors">
                <Camera className="w-6 h-6 text-white/40 mx-auto mb-2" />
                <span className="text-xs text-white/70 font-mono block">Click to capture or upload photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0]?.name || 'geotagged_photo.jpg')}
                  className="hidden"
                  id="gps-photo-upload"
                />
                <label
                  htmlFor="gps-photo-upload"
                  className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-mono text-white cursor-pointer hover:bg-white/20"
                >
                  Select File
                </label>
              </div>
            </div>
          </div>
        </div>
      );

    case 'image':
    case 'file':
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block">
            {type === 'image' ? 'Upload Proof Screenshot / Image' : 'Upload Verification Document / File'}
          </label>
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-[#836EF9]/50 transition-colors liquid-glass">
            <Upload className="w-8 h-8 text-[#836EF9] mx-auto mb-2" />
            <div className="text-xs text-white font-medium mb-1">Drag and drop file here or click to browse</div>
            <div className="text-[10px] font-mono text-white/40">PNG, JPG, PDF, SVG up to 25MB</div>
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0]?.name || 'proof_file.pdf')}
              className="hidden"
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              className="inline-block mt-3 px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-full cursor-pointer hover:bg-white/90 shadow-md"
            >
              Browse File
            </label>
            {value && <div className="mt-2 text-xs font-mono text-emerald-400">Selected: {value}</div>}
          </div>
        </div>
      );

    case 'screen_recording':
    case 'video':
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block">Screen Recording / Video Upload</label>
          <div className="liquid-glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Record Web Session</div>
                <div className="text-[11px] font-mono text-white/50">Capture screen audio & user interactions</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange('screen_recording_session.mp4')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>{value ? 'Recorded' : 'Start Record'}</span>
            </button>
          </div>
        </div>
      );

    case 'checklist':
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block">Verification Checklist</label>
          <div className="space-y-2">
            {[
              'Reviewed Section 4.2 Liability Clause',
              'Confirmed California Civil Code § 1668 Compliance',
              'Verified No Ambiguous Waivers Present',
            ].map((check, i) => (
              <label
                key={i}
                className="liquid-glass rounded-xl p-3 border border-white/10 flex items-center gap-3 text-xs text-white/80 cursor-pointer hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => onChange(e.target.checked ? 'Checklist Verified' : '')}
                  className="rounded border-white/20 bg-black text-[#836EF9] focus:ring-0"
                />
                <span>{check}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block">Verification Output / Text Proof</label>
          <textarea
            rows={4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Provide detailed findings, proof of work, or audit output..."
            className="w-full bg-[#111113] border border-white/15 rounded-2xl p-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#836EF9] transition-all resize-none font-mono"
          />
        </div>
      );
  }
};
