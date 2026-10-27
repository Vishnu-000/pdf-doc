import React from 'react';
import { getActiveTool, getToolMetadata } from '../registry';
import { ToolShell } from '../components/shell/ToolShell';
import { ChevronRight, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { Icon } from '../components/common/Icon';

interface ToolPageProps {
  toolId: string;
  onNavigateHome: () => void;
  onSelectCategory?: (category: string) => void;
}

export const ToolPage: React.FC<ToolPageProps> = ({
  toolId,
  onNavigateHome,
}) => {
  const activeDef = getActiveTool(toolId);
  const metadata = getToolMetadata(toolId);

  if (!metadata) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tool Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested tool does not exist in the PDF-Doc registry.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-brand-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            Home
          </button>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-slate-400">{metadata.category}</span>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="font-semibold text-slate-800">{metadata.name}</span>
        </div>
      </div>

      {/* Render Active Tool Shell */}
      {activeDef ? (
        (() => {
          const ToolComponent = activeDef.Component;
          return (
            <ToolShell
              key={metadata.id}
              metadata={activeDef.metadata}
              execute={activeDef.execute}
              renderOptions={
                ToolComponent
                  ? (props) => <ToolComponent {...props} />
                  : undefined
              }
              initialOptions={activeDef.defaultOptions}
              onBackToHome={onNavigateHome}
            />
          );
        })()
      ) : (
        /* Roadmap / Future Server Tool Notice */
        <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80">
            <Icon name={metadata.iconName} size={32} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-3">
              <Clock size={13} />
              <span>Server-Side Tool • Scheduled for Phase 2</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{metadata.name}</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-2">
              {metadata.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto text-left space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-500" /> Phase 1 Status:
            </span>
            <p>
              In Phase 1, we prioritized the 10 pure client-side PDF tools (Merge, Split, Remove Pages, Extract Pages, Organize, Rotate, Page Numbers, Watermark, JPG to PDF, PDF to JPG).
            </p>
            <p>
              The FastAPI backend and Redis/RQ worker scaffold are in place and ready for {metadata.name} in Phase 2!
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            Explore Active Phase 1 Tools
          </button>
        </div>
      )}
    </div>
  );
};
