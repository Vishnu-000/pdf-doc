import React, { useRef } from 'react';
import { formatBytes } from '../../lib/file-utils';
import {
  FileText,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  GripVertical,
} from 'lucide-react';

interface FileListProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
  onAddMore?: (newFiles: File[]) => void;
  acceptedTypes: string[];
  allowMultiple: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onReorder,
  onRemove,
  onAddMore,
  acceptedTypes,
  allowMultiple,
}) => {
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
  };

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onAddMore) {
      const added = Array.from(e.target.files);
      onAddMore(added);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Selected Files ({files.length})
        </span>

        {allowMultiple && onAddMore && (
          <>
            <input
              ref={addMoreInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleAddMoreFiles}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => addMoreInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-md transition-colors"
            >
              <Plus size={14} /> Add more files
            </button>
          </>
        )}
      </div>

      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}-${file.size}`}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl shadow-xs transition-all duration-150 group"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {formatBytes(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {files.length > 1 && (
                <div className="flex items-center gap-0.5 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => moveItem(index, index - 1)}
                    disabled={index === 0}
                    title="Move up"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-white"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, index + 1)}
                    disabled={index === files.length - 1}
                    title="Move down"
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded hover:bg-white"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onRemove(index)}
                title="Remove file"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
