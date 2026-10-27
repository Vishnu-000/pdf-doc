import React from 'react';
import { WatermarkOptions } from './logic';

interface WatermarkProps {
  options: WatermarkOptions;
  setOptions: React.Dispatch<React.SetStateAction<WatermarkOptions>>;
  disabled?: boolean;
}

export const WatermarkComponent: React.FC<WatermarkProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Watermark Text
        </label>
        <input
          type="text"
          value={options.text || ''}
          onChange={(e) => setOptions((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium placeholder-slate-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Color
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['gray', 'red', 'blue'] as const).map((color) => (
            <button
              key={color}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, color }))}
              className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                options.color === color
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Font Size ({options.fontSize || 48}pt)
          </label>
          <input
            type="range"
            min={20}
            max={90}
            value={options.fontSize || 48}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, fontSize: parseInt(e.target.value, 10) }))
            }
            disabled={disabled}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Opacity ({Math.round((options.opacity || 0.35) * 100)}%)
          </label>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={options.opacity || 0.35}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))
            }
            disabled={disabled}
            className="w-full accent-brand-600 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Rotation ({options.rotation || 45}°)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={-90}
            max={90}
            step={5}
            value={options.rotation || 45}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, rotation: parseInt(e.target.value, 10) }))
            }
            disabled={disabled}
            className="flex-1 accent-brand-600 cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setOptions((prev) => ({ ...prev, rotation: 0 }))}
            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
          >
            Horizontal (0°)
          </button>
        </div>
      </div>
    </div>
  );
};
