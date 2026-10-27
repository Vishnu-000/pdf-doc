import React from 'react';
import { JpgToPdfOptions } from './logic';

interface JpgToPdfProps {
  options: JpgToPdfOptions;
  setOptions: React.Dispatch<React.SetStateAction<JpgToPdfOptions>>;
  disabled?: boolean;
}

export const JpgToPdfComponent: React.FC<JpgToPdfProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Page Orientation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['auto', 'portrait', 'landscape'] as const).map((ori) => (
            <button
              key={ori}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, pageOrientation: ori }))}
              className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                options.pageOrientation === ori
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {ori}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Page Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['a4', 'letter', 'fit'] as const).map((size) => (
            <button
              key={size}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, pageSize: size }))}
              className={`p-2 rounded-lg border text-xs font-semibold uppercase transition-all ${
                options.pageSize === size
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {size === 'fit' ? 'Fit Image' : size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Margin
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['none', 'small', 'big'] as const).map((m) => (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, margin: m }))}
              className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                options.margin === m
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {m === 'none' ? 'No Margin' : `${m} Margin`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
