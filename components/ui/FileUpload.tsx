'use client';
import { useState, useRef } from 'react';
import { Upload, Check, X, Loader } from 'lucide-react';
import { uploadFile, generateFilePath } from '@/lib/firebase';
import { useAuth } from '@/store/auth';

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  fieldName: string;
  helpText?: string;
}

export default function FileUpload({ label, value, onChange, accept = 'image/*,application/pdf', fieldName, helpText }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const path = generateFilePath(user.userId, fieldName, file.name);
      const url = await uploadFile(file, path, setProgress);
      onChange(url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          value ? 'border-green-300 bg-green-50' :
          error ? 'border-red-300 bg-red-50' :
          'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader size={24} className="text-blue-500 animate-spin" />
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
          </div>
        ) : value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <Check size={16} />
              <span className="text-sm font-medium">File uploaded</span>
            </div>
            <div className="flex gap-2">
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                View
              </a>
              <button
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Upload size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              Drop file here or <span className="text-blue-600 font-medium">browse</span>
            </span>
            {helpText && <span className="text-xs text-gray-400">{helpText}</span>}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
