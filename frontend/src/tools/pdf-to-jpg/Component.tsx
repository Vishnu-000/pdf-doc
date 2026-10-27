import React from 'react';
import { PdfToJpgOptions } from './logic';

interface PdfToJpgProps {
  options: PdfToJpgOptions;
  setOptions: React.Dispatch<React.SetStateAction<PdfToJpgOptions>>;
  disabled?: boolean;
}

export const PdfToJpgComponent: React.FC<PdfToJpgProps> = ({
  options,
  setOptions,
  disabled,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Image Format
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {(['jpeg', 'png'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              disabled={disabled}
              onClick={() => setOptions((prev) => ({ ...prev, imageFormat: fmt }))}
              className={`p-2.5 rounded-lg border text-xs font-semibold uppercase text-center transition-all ${
                options.imageFormat === fmt
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {fmt === 'jpeg' ? 'JPG (Recommended)' : 'PNG (Lossless)'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Quality / Resolution
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, quality: 'normal' }))}
            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.quality === 'normal'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">Standard (150 DPI)</div>
            <div className="text-slate-500 mt-0.5">Faster, compact file size</div>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOptions((prev) => ({ ...prev, quality: 'high' }))}
            className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
              options.quality === 'high'
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-sm">High (300 DPI)</div>
            <div className="text-slate-500 mt-0.5">Crisp, print-ready detail</div>
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
        If your document has multiple pages, all pages will be rendered and downloaded together in a ZIP file.
      </div>
    </div>
  );
};
