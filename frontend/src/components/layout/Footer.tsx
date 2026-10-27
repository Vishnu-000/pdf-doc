import React from 'react';
import { CATEGORY_LIST } from '../../registry/categories';
import { getToolsByCategory } from '../../registry';
import { ShieldCheck, Heart, FileCheck2 } from 'lucide-react';

interface FooterProps {
  onSelectTool: (toolId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Privacy Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                100% Client-Side Privacy Guarantee
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                All Phase 1 PDF operations execute in your web browser. Your files never touch a third-party server.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-xs flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Zero Server Uploads
          </div>
        </div>

        {/* Categories Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 text-xs">
          {CATEGORY_LIST.map((cat) => {
            const tools = getToolsByCategory(cat.name);
            return (
              <div key={cat.name} className="space-y-2">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  {cat.name}
                </h5>
                <ul className="space-y-1.5 text-slate-500">
                  {tools.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => onSelectTool(t.id)}
                        className="hover:text-brand-600 transition-colors text-left"
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              <FileCheck2 size={14} />
            </div>
            <span className="font-semibold text-slate-700">PDF-Doc</span>
            <span>— The Modern Web-Based PDF Toolkit</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision & privacy</span>
            <span>• © {new Date().getFullYear()} HiddenWave</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
