import React from 'react';
import { RepairOptions, RepairMode } from './logic';
import { Wrench, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RepairProps {
  options: RepairOptions;
  setOptions: React.Dispatch<React.SetStateAction<RepairOptions>>;
  disabled?: boolean;
}

export const RepairComponent: React.FC<RepairProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const modes: {
    id: RepairMode;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'standard',
      title: 'Standard Reconstruction',
      description: 'Rebuilds broken xref tables, restores stream dictionaries, and purges dangling objects.',
      badge: 'Recommended',
    },
    {
      id: 'deep',
      title: 'Deep Structure Recovery',
      description: 'Escalated recovery for unreadable files using resilient visual raster re-indexing.',
      badge: 'Advanced',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Recovery Strategy
        </label>
        <div className="space-y-2.5">
          {modes.map((m) => {
            const isSelected = (options.mode || 'standard') === m.id;
            return (
              <div
                key={m.id}
                onClick={() => !disabled && setOptions({ mode: m.id })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench size={14} className={isSelected ? 'text-brand-600' : 'text-slate-400'} />
                    {m.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {m.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 space-y-2">
        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Automated Recovery Actions:
        </span>
        <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
          <li>Rebuild corrupted Cross-Reference (XRef) offsets</li>
          <li>Repair damaged / missing trailer dictionaries</li>
          <li>Purge orphan indirect objects and broken streams</li>
          <li>Normalize page tree hierarchies and font references</li>
        </ul>
      </div>

      <div className="rounded-xl bg-blue-50/60 border border-blue-200 p-3 text-xs text-blue-900 flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <span>
          PDF recovery runs client-side directly in your browser. None of your document contents are ever transmitted to an external server.
        </span>
      </div>
    </div>
  );
};
