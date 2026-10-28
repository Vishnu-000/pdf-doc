import React from 'react';
import { RemovePagesOptions } from './logic';
import { parsePageRange } from '../../lib/file-utils';

interface RemovePagesProps {
  options: RemovePagesOptions;
  setOptions: React.Dispatch<React.SetStateAction<RemovePagesOptions>>;
  disabled?: boolean;
}

export const RemovePagesComponent: React.FC<RemovePagesProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Pages to Remove
        </label>
        <input
          type="text"
          value={options.rangeString || ''}
          onChange={(e) => {
            const val = e.target.value;
            const parsed = parsePageRange(val, 9999);
            setOptions((prev) => ({
              ...prev,
              rangeString: val,
              pagesToRemove: parsed,
            }));
          }}
          placeholder="e.g. 2, 4-6, 9"
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400"
        />
        <p className="text-xs text-slate-500 mt-1.5">
          Enter page numbers or ranges separated by commas. You can also click page thumbnails directly to toggle deletion.
        </p>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        <span className="font-semibold">Notice:</span> At least one page must remain in the document.
      </div>
    </div>
  );
};
