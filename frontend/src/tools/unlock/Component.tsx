import React, { useState } from 'react';
import { UnlockOptions } from './logic';
import { Unlock, Eye, EyeOff, KeyRound } from 'lucide-react';

interface UnlockProps {
  options: UnlockOptions;
  setOptions: React.Dispatch<React.SetStateAction<UnlockOptions>>;
  disabled?: boolean;
}

export const UnlockComponent: React.FC<UnlockProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Enter Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={options.password || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Document open password..."
            disabled={disabled}
            className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex items-start gap-2">
        <KeyRound size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <span>
          Enter the password once to permanently strip password requirements from the saved copy.
        </span>
      </div>
    </div>
  );
};
