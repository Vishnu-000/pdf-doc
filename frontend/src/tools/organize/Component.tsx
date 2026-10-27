import React from 'react';
import { OrganizeOptions } from './logic';
import { RotateCw, RotateCcw, RotateCcw as ResetIcon } from 'lucide-react';

interface OrganizeProps {
  options: OrganizeOptions;
  setOptions: React.Dispatch<React.SetStateAction<OrganizeOptions>>;
  disabled?: boolean;
}

export const OrganizeComponent: React.FC<OrganizeProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const pageCount = options.pages?.length || 0;

  const rotateAll = (deg: number) => {
    setOptions((prev) => ({
      ...prev,
      pages: (prev.pages || []).map((p) => ({
        ...p,
        rotation: (p.rotation + deg + 360) % 360,
      })),
    }));
  };

  const resetAll = () => {
    setOptions((prev) => ({
      ...prev,
      pages: (prev.pages || []).map((p, index) => ({
        ...p,
        originalPageIndex: index,
        rotation: 0,
      })),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
        <span className="text-sm text-slate-600 font-medium">Output Pages:</span>
        <span className="text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
          {pageCount}
        </span>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Batch Actions
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => rotateAll(90)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <RotateCw size={14} /> Rotate All +90°
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => rotateAll(-90)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <RotateCcw size={14} /> Rotate All -90°
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200/60 p-3 text-xs text-blue-900">
        <span className="font-semibold text-blue-700">How to Organize:</span>
        <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
          <li>Drag pages in the main grid to change sequence</li>
          <li>Hover any page to rotate, duplicate, or delete it</li>
        </ul>
      </div>
    </div>
  );
};
