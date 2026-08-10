import React, { useState, useCallback, useEffect } from 'react';
import { storageApi } from '../../lib/api';
import { Upload, X } from 'lucide-react';

interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview: string;
  url?: string;
  cid?: string;
  uploading?: boolean;
  error?: string;
  progress?: number;
}

interface CreatorAttachmentsProps {
  value: AttachmentFile[];
  onChange: (files: AttachmentFile[]) => void;
}

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return <span className="text-2xl">🖼️</span>;
  if (type?.startsWith('video/')) return <span className="text-2xl">🎬</span>;
  if (type?.startsWith('audio/')) return <span className="text-2xl">🎵</span>;
  return <span className="text-2xl">📄</span>;
};

export const CreatorAttachments: React.FC<CreatorAttachmentsProps> = ({
  value = [],
  onChange,
}) => {
  const [files, setFiles] = useState<AttachmentFile[]>(value || []);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Sync with prop changes
  useEffect(() => {
    setFiles(value || []);
  }, [value]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    for (const file of newFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploading(fileId);
    setProgress(0);

    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file);
    const newAttachment: AttachmentFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: previewUrl,
      uploading: true,
      progress: 0,
    };

    // Optimistically add to list
    const newFiles = [...(files || []), newAttachment];
    setFiles(newFiles);
    onChange(newFiles);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 100);

      const response = await storageApi.upload(file);
      clearInterval(progressInterval);
      setProgress(100);

      const uploadData = response.data;

      // Replace optimistic entry with real data
      const updatedFiles = (files || []).map((a: AttachmentFile) =>
        a.id === fileId
          ? { ...a, ...uploadData, url: uploadData.url, cid: uploadData.cid, uploading: false, progress: 100 }
          : a
      );
      setFiles(updatedFiles);
      onChange(updatedFiles);

      setTimeout(() => setUploading(null), 500);
    } catch (error) {
      console.error('Upload failed:', error);
      // Keep local preview but mark as failed
      const failedFiles = (files || []).map((a: AttachmentFile) =>
        a.id === fileId ? { ...a, error: 'Upload failed', uploading: false } : a
      );
      setFiles(failedFiles);
      onChange(failedFiles);
      setUploading(null);
    }
  };

  const removeFile = (fileId: string) => {
    const filteredFiles = (files || []).filter((a: AttachmentFile) => a.id !== fileId);
    setFiles(filteredFiles);
    onChange(filteredFiles);
  };

  const currentFiles = value || [];

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-white/60 mb-1 block">
        Attachments (Optional) — images, docs, reference files for workers
      </label>

      <div
        className={`rounded-2xl p-5 border transition-all flex flex-col items-center gap-3 ${
          dragActive ? 'border-[#836EF9] bg-[#836EF9]/10' : 'liquid-glass border-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="*/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="creator-attachments-input"
        />
        <label
          htmlFor="creator-attachments-input"
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-xs font-mono cursor-pointer"
        >
          <Upload className="w-4 h-4 inline mr-2" /> Click or drag files here
        </label>

        <p className="text-[10px] font-mono text-white/30 text-center">
          Supports images, videos, audio, documents (max 50MB each)
        </p>

        {currentFiles.length > 0 && (
          <div className="w-full space-y-2 mt-2">
            {currentFiles.map((file, index) => (
              <div
                key={file.id || index}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  file.uploading
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-black/30">
                  {file.preview && file.type?.startsWith('image/') ? (
                    <img src={file.preview} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-white/80 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-white/40">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    {file.cid && (
                      <span className="text-[10px] font-mono text-emerald-400">
                        IPFS: {file.cid.slice(0, 12)}...
                      </span>
                    )}
                    {file.uploading && (
                      <>
                        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#836EF9] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-amber-400">Uploading...</span>
                      </>
                    )}
                    {file.error && (
                      <span className="text-[10px] font-mono text-red-400">{file.error}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id || String(index))}
                  disabled={file.uploading}
                  className="p-1 text-red-400 hover:text-red-300 opacity-50 hover:opacity-100 disabled:opacity-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



export default CreatorAttachments;