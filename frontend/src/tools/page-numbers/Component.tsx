import React from 'react';
import { PageNumbersOptions, PageNumberPosition, PageNumberFormat } from './logic';

interface PageNumbersProps {
  options: PageNumbersOptions;
  setOptions: React.Dispatch<React.SetStateAction<PageNumbersOptions>>;
  disabled?: boolean;
}

export const PageNumbersComponent: React.FC<PageNumbersProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const positions: { id: PageNumberPosition; label: string }[] = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  const formats: { id: PageNumberFormat; label: string; example: string }[] = [
    { id: 'page_n_of_total', label: 'Page X of Y', example: 'Page 1 of 12' },
    { id: 'page_n', label: 'Page X', example: 'Page 1' },
    { id: 'n', label: 'Number only', example: '1' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Position on Page
        </label>
        <div className="grid grid-cols-3 gap-2">
          {positions.map((pos) => (
            <button
              key={pos.id}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, position: pos.id }))}
              className={`p-2 rounded-lg border text-xs font-medium text-center transition-all ${
                options.position === pos.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Text Format
        </label>
        <div className="space-y-2">
          {formats.map((fmt) => (
            <label
              key={fmt.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                options.format === fmt.id
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="page_format"
                  checked={options.format === fmt.id}
                  onChange={() => setOptions((prev) => ({ ...prev, format: fmt.id }))}
                  disabled={disabled}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium">{fmt.label}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {fmt.example}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Font Size (pt)
          </label>
          <input
            type="number"
            min={6}
            max={36}
            value={options.fontSize || 10}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, fontSize: parseInt(e.target.value, 10) || 10 }))
            }
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Start From
          </label>
          <input
            type="number"
            min={1}
            value={options.startFrom || 1}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, startFrom: parseInt(e.target.value, 10) || 1 }))
            }
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
