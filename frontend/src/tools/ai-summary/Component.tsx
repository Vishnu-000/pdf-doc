import React from 'react';
import { AiSummaryOptions, SummaryMode } from './logic';
import { Sparkles, HelpCircle, FileCheck, ShieldCheck, MessageSquare } from 'lucide-react';

interface AiSummaryProps {
  options: AiSummaryOptions;
  setOptions: React.Dispatch<React.SetStateAction<AiSummaryOptions>>;
  disabled?: boolean;
}

export const AiSummaryComponent: React.FC<AiSummaryProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const modes: {
    id: SummaryMode;
    title: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'executive',
      title: 'Executive Briefing',
      description: 'High-level synthesis of core themes, metrics, and document conclusions.',
      badge: 'Popular',
    },
    {
      id: 'bullets',
      title: 'Key Takeaways & Citations',
      description: 'Prioritized bullet findings annotated with exact page reference tags.',
      badge: 'Fast',
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Digest',
      description: 'In-depth overview covering section summaries, key data, and action items.',
      badge: 'In-Depth',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Intelligence Depth
        </label>
        <div className="space-y-2.5">
          {modes.map((m) => {
            const isSelected = (options.mode || 'executive') === m.id;
            return (
              <div
                key={m.id}
                onClick={() => !disabled && setOptions((prev) => ({ ...prev, mode: m.id }))}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className={isSelected ? 'text-brand-600' : 'text-slate-400'} />
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

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Ask Document a Question <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={options.userQuestion || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, userQuestion: e.target.value }))
            }
            disabled={disabled}
            placeholder="e.g. What are the key findings or deadlines?"
            className="w-full px-3.5 py-2.5 pl-9 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-slate-800 transition-all placeholder:text-slate-400"
          />
          <MessageSquare size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            'What are the key conclusions?',
            'List all metrics & numbers',
            'What are the action items?',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, userQuestion: prompt }))}
              className="text-[10px] font-medium px-2 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 rounded-lg transition-colors border border-slate-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-purple-50/60 border border-purple-200 p-3 text-xs text-purple-900 flex items-start gap-2">
        <ShieldCheck size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <span>
          Private & Secure: Document text analysis runs 100% in your browser. No confidential document data is sent to external third-party LLMs.
        </span>
      </div>
    </div>
  );
};
