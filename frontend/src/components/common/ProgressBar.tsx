import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  percentage: number;
  message: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  message,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl border border-slate-200/80 shadow-soft text-center space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5 text-brand-600">
          <Loader2 size={14} className="animate-spin" /> Processing...
        </span>
        <span className="font-mono text-slate-700">{clamped}%</span>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300 ease-out shadow-xs"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <p className="text-sm font-medium text-slate-700 truncate">{message}</p>
      <p className="text-xs text-slate-400">
        All processing occurs locally in your browser.
      </p>
    </div>
  );
};
