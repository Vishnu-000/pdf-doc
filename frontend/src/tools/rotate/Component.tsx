import React from 'react';
import { RotateOptions } from './logic';
import { RotateCw, RotateCcw } from 'lucide-react';

interface RotateProps {
  options: RotateOptions;
  setOptions: React.Dispatch<React.SetStateAction<RotateOptions>>;
  disabled?: boolean;
}

export const RotateComponent: React.FC<RotateProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Rotation Angle
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, angle: 90 }))}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
              options.angle === 90
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <RotateCw size={18} className="mb-1 text-brand-600" />
            <span>Right 90°</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, angle: 180 }))}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
              options.angle === 180
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <RotateCw size={18} className="mb-1 text-brand-600" />
            <span>180° Flip</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, angle: 270 }))}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
              options.angle === 270
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <RotateCcw size={18} className="mb-1 text-brand-600" />
            <span>Left 90°</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Scope
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, scope: 'all' }))}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              options.scope === 'all'
                ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            All Pages
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, scope: 'custom' }))}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              options.scope === 'custom'
                ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            Custom Pages
          </button>
        </div>
      </div>

      {options.scope === 'custom' && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            Pages to Rotate
          </label>
          <input
            type="text"
            value={options.customRange || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, customRange: e.target.value }))
            }
            placeholder="e.g. 1, 3-5"
            disabled={disabled}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
          />
        </div>
      )}
    </div>
  );
};
