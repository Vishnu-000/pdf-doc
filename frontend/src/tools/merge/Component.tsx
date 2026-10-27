import React from 'react';
import { MergeOptions } from './logic';

interface MergeOptionsProps {
  options: MergeOptions;
  setOptions: React.Dispatch<React.SetStateAction<MergeOptions>>;
  disabled?: boolean;
}

export const MergeComponent: React.FC<MergeOptionsProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Output File Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={options.outputFileName || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, outputFileName: e.target.value }))
            }
            placeholder="merged_document.pdf"
            disabled={disabled}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 disabled:cursor-not-allowed placeholder-slate-400"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          Leave blank to default to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">merged_document.pdf</code>
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200/60 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
        <span className="font-semibold text-blue-700 flex-shrink-0">Tip:</span>
        <span>
          Drag and drop the files in the left queue to change the order in which they will be merged.
        </span>
      </div>
    </div>
  );
};
