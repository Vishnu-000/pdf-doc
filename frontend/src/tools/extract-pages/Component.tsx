import React from 'react';
import { ExtractPagesOptions } from './logic';
import { parsePageRange } from '../../lib/file-utils';

interface ExtractPagesProps {
  options: ExtractPagesOptions;
  setOptions: React.Dispatch<React.SetStateAction<ExtractPagesOptions>>;
  disabled?: boolean;
}

export const ExtractPagesComponent: React.FC<ExtractPagesProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Extraction Mode
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, extractMode: 'single-pdf' }))}
            className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.extractMode === 'single-pdf'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">One PDF</div>
            <div className="text-slate-500 mt-0.5">Merge into single file</div>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, extractMode: 'separate-pdfs' }))}
            className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.extractMode === 'separate-pdfs'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">Separate PDFs</div>
            <div className="text-slate-500 mt-0.5">Download as ZIP archive</div>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Pages to Extract
        </label>
        <input
          type="text"
          value={options.rangeString || ''}
          onChange={(e) => {
            const val = e.target.value;
            const parsed = parsePageRange(val, 9999);
            setOptions((prev) => ({
              ...prev,
              rangeString: val,
              selectedPages: parsed,
            }));
          }}
          placeholder="e.g. 1-3, 5, 7"
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
        />
        <p className="text-xs text-slate-500">
          Specify page numbers or ranges. You can also click page thumbnails directly in the workspace.
        </p>
      </div>
    </div>
  );
};
