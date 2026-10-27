import React, { useState, useRef } from 'react';
import { UploadCloud, ShieldCheck, FileCheck } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes: string[];
  allowMultiple: boolean;
  minFiles?: number;
  maxFiles?: number;
  title?: string;
  subtitle?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  acceptedTypes,
  allowMultiple,
  title = 'Select PDF files',
  subtitle = 'or drop PDF files here',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      processFiles(selected);
    }
  };

  const processFiles = (files: File[]) => {
    const valid = files.filter((f) => {
      // If accepts all or mime match or extension match
      return acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return f.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          const prefix = type.replace('/*', '');
          return f.type.startsWith(prefix);
        }
        return f.type === type;
      });
    });

    if (valid.length === 0) {
      alert(`Please select supported files (${acceptedTypes.join(', ')})`);
      return;
    }

    onFilesSelected(allowMultiple ? valid : [valid[0]]);
  };

  const acceptedString = acceptedTypes.join(',');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full max-w-3xl mx-auto rounded-2xl border-2 border-dashed p-10 md:p-14 text-center cursor-pointer transition-all duration-200 ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/70 scale-[1.01] shadow-lg'
          : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50 shadow-soft'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={allowMultiple}
        accept={acceptedString}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
            isDragOver
              ? 'bg-brand-500 text-white scale-110 shadow-md'
              : 'bg-brand-50 text-brand-600 group-hover:scale-105'
          }`}
        >
          <UploadCloud size={40} strokeWidth={1.75} />
        </div>

        <div>
          <button
            type="button"
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 inline-flex items-center gap-2"
          >
            <FileCheck size={18} />
            {title}
          </button>
          <p className="text-sm font-medium text-slate-500 mt-3">{subtitle}</p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            100% Private Client-Side Processing
          </span>
          <span className="text-slate-400">
            {allowMultiple ? 'Multiple files supported' : 'Single file'}
          </span>
        </div>
      </div>
    </div>
  );
};
