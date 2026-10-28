import React, { useEffect, useState } from 'react';
import {
  AiSummaryOptions,
  DocumentAnalysis,
  analyzeDocumentText,
  SummaryMode,
} from './logic';
import { extractPdfText } from '../../lib/pdf-renderer';
import { readFileAsArrayBuffer, formatBytes } from '../../lib/file-utils';
import { PageGrid } from '../../components/common/PageGrid';
import {
  Sparkles,
  FileText,
  Clock,
  BookOpen,
  Award,
  Hash,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Layers,
  Search,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface AiSummaryWorkspaceProps {
  file: File;
  options: AiSummaryOptions;
  setOptions: React.Dispatch<React.SetStateAction<AiSummaryOptions>>;
  onReset: () => void;
}

export const AiSummaryWorkspace: React.FC<AiSummaryWorkspaceProps> = ({
  file,
  options,
  setOptions,
  onReset,
}) => {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [progressMsg, setProgressMsg] = useState<string>('Analyzing document text...');
  const [activeTab, setActiveTab] = useState<'insights' | 'pages'>('insights');
  const [localQuestion, setLocalQuestion] = useState<string>(options.userQuestion || '');

  // Extract text and analyze document on mount or when file changes
  useEffect(() => {
    let isMounted = true;

    async function runAnalysis() {
      try {
        setLoading(true);
        const buffer = await readFileAsArrayBuffer(file);
        const pages = await extractPdfText(buffer, (cur, tot) => {
          if (isMounted) {
            setProgressMsg(`Extracting text from page ${cur} of ${tot}...`);
          }
        });

        if (isMounted) {
          setProgressMsg('Generating multi-depth intelligence model...');
          const result = analyzeDocumentText(pages, options.userQuestion);
          setAnalysis(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to analyze document', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Re-run Q&A when userQuestion changes
  const handleAskQuestion = (q: string) => {
    if (!analysis) return;
    setOptions((prev) => ({ ...prev, userQuestion: q }));
    setLoading(true);
    setTimeout(async () => {
      const buffer = await readFileAsArrayBuffer(file);
      const pages = await extractPdfText(buffer);
      const result = analyzeDocumentText(pages, q);
      setAnalysis(result);
      setLoading(false);
    }, 50);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200/90 shadow-soft min-h-[420px]">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Sparkles size={28} />
        </div>
        <Loader2 size={28} className="text-brand-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-800">{progressMsg}</p>
        <p className="text-xs text-slate-400 mt-1">
          Extracting text layers and computing semantic density client-side...
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm text-slate-500">Failed to extract text from document.</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Another File
        </button>
      </div>
    );
  }

  const mode = options.mode || 'executive';

  return (
    <div className="space-y-6">
      {/* Top Document Header & Telemetry Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-slate-400">
                {formatBytes(file.size)} • {analysis.pageCount} Pages • {analysis.wordCount.toLocaleString()} Words
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('insights')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'insights'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Intelligence View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pages')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'pages'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page Previews
              </button>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Change file"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Intelligence DNA Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Clock size={16} className="text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Reading Time
              </span>
              <span className="text-xs font-bold text-slate-800">
                ~{analysis.readingTimeMinutes} min
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <BookOpen size={16} className="text-indigo-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Complexity
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block" title={analysis.complexityScore}>
                {analysis.complexityScore.split('(')[0]}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Award size={16} className="text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Lexical Diversity
              </span>
              <span className="text-xs font-bold text-slate-800">
                {analysis.lexicalRichnessPercent}% unique
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Hash size={16} className="text-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Data Points
              </span>
              <span className="text-xs font-bold text-slate-800">
                {analysis.quantitativeMetrics.length} metrics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === 'pages' ? (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-soft">
          <PageGrid file={file} mode="preview" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Real-time Q&A Output (if asked) */}
          {analysis.answeredQuestion && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-blue-600" />
                  Q&A Result: "{analysis.answeredQuestion.question}"
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
                  {analysis.answeredQuestion.confidence}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-blue-100">
                "{analysis.answeredQuestion.answer}"
              </p>
              {analysis.answeredQuestion.pageReference && (
                <div className="mt-2 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  <span>Source: Page {analysis.answeredQuestion.pageReference}</span>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC VIEW ACCORDING TO SELECTED MODE */}
          {mode === 'executive' && (
            <div className="space-y-4">
              {/* Executive Thesis Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Executive Thesis & Strategic Overview
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {analysis.executiveThesis}
                </p>
              </div>

              {/* Strategic Highlights Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Key Strategic Highlights
                </h4>
                <div className="space-y-2.5">
                  {analysis.strategicHighlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                        {i + 1}
                      </span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recommended Next Steps
                </h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'bullets' && (
            <div className="space-y-4">
              {/* Verified Citations List */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Verified Findings with Page Citations
                </h4>
                <div className="space-y-3">
                  {analysis.citedFindings.map((cf, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                      <p className="text-xs text-slate-700 leading-relaxed flex-1">
                        • {cf.text}
                      </p>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 flex-shrink-0">
                        Page {cf.page}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantitative Metrics & Data Points */}
              {analysis.quantitativeMetrics.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Extracted Quantitative Data Points
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.quantitativeMetrics.map((qm, i) => (
                      <div key={i} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-emerald-800">
                            {qm.metric}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">
                            Page {qm.page}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {qm.context}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {analysis.actionItems.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Obligations & Action Items
                  </h4>
                  <div className="space-y-2">
                    {analysis.actionItems.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 flex items-start gap-2.5">
                        <ArrowRight size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 flex-1">{act.action}</span>
                        <span className="text-[10px] font-semibold text-amber-700">Page {act.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'comprehensive' && (
            <div className="space-y-4">
              {/* Page-by-Page Breakdown */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Document Page-by-Page Breakdown
                </h4>
                <div className="space-y-3">
                  {analysis.pageBreakdown.map((pb) => (
                    <div key={pb.pageNumber} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers size={13} className="text-brand-500" />
                          Page {pb.pageNumber}: {pb.inferredTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {pb.keyPoints.join(' ') || 'Content page analyzed.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossary of Terms */}
              {analysis.glossary.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Key Technical Acronyms & Terminology
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analysis.glossary.map((g, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-extrabold text-slate-900 block">
                          {g.term}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {g.count} occurrences • Page {g.page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Interactive Question Ask Bar in Workspace */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={localQuestion}
                onChange={(e) => setLocalQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskQuestion(localQuestion);
                }}
                placeholder="Ask any question about this document (e.g. 'What are the main results?')..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => handleAskQuestion(localQuestion)}
              className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Ask AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
