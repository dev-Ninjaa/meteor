import React, { useState, useCallback } from 'react';
import { SubmissionType } from '../../types';
import { storageApi } from '../../lib/api';
import {
  Type,
  CheckSquare,
  Star,
  FileText,
  LinkIcon,
  ListChecks,
  Upload,
  Image,
  Video,
  Music,
  File,
  Loader2,
} from 'lucide-react';

interface SubmissionRendererProps {
  type: SubmissionType;
  options?: string[];
  onChange: (value: any) => void;
  value: any;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image': return <Image className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'audio': return <Music className="w-4 h-4" />;
    case 'document': return <File className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getFileTypes = (type: string): string => {
  switch (type) {
    case 'image': return 'image/*';
    case 'video': return 'video/*';
    case 'audio': return 'audio/*';
    case 'document': return '.pdf,.doc,.docx,.txt,.md,.json';
    default: return '*/*';
  }
};

export const SubmissionRenderer: React.FC<SubmissionRendererProps> = ({
  type,
  options = [],
  onChange,
  value,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    // Create a blob URL for preview (for images/videos/audio)
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to storage backend
      const response = await storageApi.upload(file);
            clearInterval(progressInterval);
            setUploadProgress(100);

            const uploadData = response.data; // response.data is already the { url, cid, ... } object

            // Store the uploaded file info with IPFS URL
            onChange({
              name: file.name,
              type: file.type,
              size: file.size,
              preview: previewUrl,
              url: uploadData.url,
              cid: uploadData.cid,
            });

      setTimeout(() => setIsUploading(false), 500);
    } catch (error) {
      console.error('Upload failed:', error);
      // Fallback to local preview only
      onChange({
        name: file.name,
        type: file.type,
        size: file.size,
        preview: previewUrl,
        error: 'Upload failed - using local preview only',
      });
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setFileName(null);
    setIsUploading(false);
    setUploadProgress(0);
    onChange(null);
  };

  const isMediaUpload = ['image', 'video', 'audio', 'document', 'file'].includes(type);

  if (isMediaUpload) {
    const acceptTypes = getFileTypes(type);
    const labelText = type === 'file' ? 'Upload File' : `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const icon = getFileIcon(type);

    return (
      <div className="space-y-2">
        <label className="text-xs font-mono text-white/70 block">
          {labelText} (Drag & Drop or Click)
        </label>
        <div
          className={`rounded-2xl p-5 border transition-all flex flex-col items-center gap-3 ${
            dragActive
              ? 'border-[#836EF9] bg-[#836EF9]/10'
              : 'liquid-glass border-white/10'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-[10px] font-mono text-white/40">
              {isUploading ? `Uploading... ${uploadProgress}%` : fileName
                ? `Selected: ${fileName}`
                : 'Drag & drop a file or click to browse'}
            </span>
          </div>

          {isUploading && (
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#836EF9] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {!fileName && !isUploading && (
                      <>
                        <input
                          type="file"
                          accept={acceptTypes}
                          onChange={handleFileInputChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id={`file-upload-${type}`}
                        />
                        <label
                          htmlFor={`file-upload-${type}`}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs font-mono cursor-pointer"
                        >
                          Choose File
                        </label>
                      </>
                    )}

          {filePreview && (
            <div className="w-full max-w-xs relative">
              {type === 'image' && (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="rounded-xl max-h-48 object-contain"
                />
              )}
              {type === 'video' && (
                <video
                  src={filePreview}
                  controls
                  className="rounded-xl max-h-48"
                />
              )}
              {type === 'audio' && (
                <audio
                  src={filePreview}
                  controls
                  className="w-full"
                />
              )}
              {(type === 'document' || type === 'file') && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                  {getFileIcon(type)}
                  <span className="text-xs text-white/80 truncate">{fileName}</span>
                  {value?.cid && (
                    <span className="text-[10px] font-mono text-emerald-400">IPFS: {value.cid.slice(0, 12)}...</span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={removeFile}
                disabled={isUploading}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
          )}

          {value?.url && !isUploading && (
            <p className="text-[10px] font-mono text-emerald-400 text-center">
              ✓ Uploaded to IPFS: <a href={value.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">{value.cid?.slice(0, 16)}...</a>
            </p>
          )}

          {!value?.url && fileName && !isUploading && (
            <p className="text-[10px] font-mono text-amber-400 text-center">
              ⚠ Local preview only. Configure Pinata for permanent IPFS storage.
            </p>
          )}
        </div>
              </div>
            );
          }

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

    case 'checklist':
      return (
        <div className="space-y-2">
          <label className="text-xs font-mono text-white/70 block">Verification Checklist</label>
          <div className="space-y-2">
            {(options.length > 0
              ? options
              : ['Reviewed Section 4.2 Liability Clause', 'Confirmed California Civil Code § 1668 Compliance', 'Verified No Ambiguous Waivers Present']
            ).map((check, i) => (
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
