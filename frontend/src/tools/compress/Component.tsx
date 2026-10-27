import React from 'react';
import { CompressOptions, CompressionLevel } from './logic';
import { Zap, ShieldCheck } from 'lucide-react';

interface CompressProps {
  options: CompressOptions;
  setOptions: React.Dispatch<React.SetStateAction<CompressOptions>>;
  disabled?: boolean;
}

export const CompressComponent: React.FC<CompressProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const levels: {
    id: CompressionLevel;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'extreme',
      title: 'Extreme Compression',
      description: 'Maximum size reduction, acceptable visual quality.',
      badge: '~70-90% smaller',
    },
    {
      id: 'recommended',
      title: 'Recommended Compression',
      description: 'Great visual balance and high reduction.',
      badge: '~40-60% smaller',
    },
    {
      id: 'low',
      title: 'Low Compression',
      description: 'Highest visual fidelity with modest reduction.',
      badge: '~20-30% smaller',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Compression Level
        </label>
        <div className="space-y-2.5">
          {levels.map((lvl) => {
            const isSelected = options.level === lvl.id;
            return (
              <div
                key={lvl.id}
                onClick={() => !disabled && setOptions({ level: lvl.id })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap size={14} className={isSelected ? 'text-brand-600' : 'text-slate-400'} />
                    {lvl.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lvl.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lvl.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <span>
          Compression executes in your browser memory without uploading your sensitive files to a remote server.
        </span>
      </div>
    </div>
  );
};
