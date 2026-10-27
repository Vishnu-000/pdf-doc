import React, { useState } from 'react';
import { ProtectOptions } from './logic';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface ProtectProps {
  options: ProtectOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProtectOptions>>;
  disabled?: boolean;
}

export const ProtectComponent: React.FC<ProtectProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Document Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={options.password || ''}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Enter secure password..."
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

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Confirm Password
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={options.confirmPassword || ''}
          onChange={(e) =>
            setOptions((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          placeholder="Repeat password..."
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
        />
        {options.password &&
          options.confirmPassword &&
          options.password !== options.confirmPassword && (
            <p className="text-xs text-rose-600 mt-1">Passwords do not match.</p>
          )}
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200/80 p-3 text-xs text-blue-900 flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <span>
          Applied using enterprise AES-256 standard. Recipients will need to enter this password to view or print the document.
        </span>
      </div>
    </div>
  );
};
