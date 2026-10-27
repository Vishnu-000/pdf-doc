import React from 'react';
import { SplitOptions } from './logic';

interface SplitOptionsProps {
  options: SplitOptions;
  setOptions: React.Dispatch<React.SetStateAction<SplitOptions>>;
  disabled?: boolean;
}

export const SplitComponent: React.FC<SplitOptionsProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Split Mode
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, mode: 'range' }))}
            className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.mode === 'range'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">Custom Range</div>
            <div className="text-slate-500 mt-0.5">Extract specified pages</div>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, mode: 'all' }))}
            className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.mode === 'all'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">Every Page</div>
            <div className="text-slate-500 mt-0.5">Separate into ZIP file</div>
          </button>
        </div>
      </div>

      {options.mode === 'range' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Page Range
          </label>
          <input
            type="text"
            value={options.rangeString || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, rangeString: e.target.value }))
            }
            placeholder="e.g. 1-3, 5, 8-10"
            disabled={disabled}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
          />
          <p className="text-xs text-slate-500">
            Use commas for individual pages and hyphens for ranges (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">1-4, 6</code>).
          </p>
        </div>
      )}

      {options.mode === 'all' && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
          Each page of your PDF will be extracted into a standalone single-page PDF document and packaged into a convenient ZIP archive.
        </div>
      )}
    </div>
  );
};
