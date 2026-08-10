// Storage API
import { api } from './index';

export const storageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    return api.post<{ statusCode: number; message: string; data: { url: string; cid: string; size: number; filename: string }; timestamp: string; path: string }>('/storage/upload', formData);
  },

  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<{ statusCode: number; message: string; data: { url: string; cid: string; size: number; filename: string }[]; timestamp: string; path: string }>('/storage/upload-multiple', formData);
  },
};