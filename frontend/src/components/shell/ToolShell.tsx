import React, { useState } from 'react';
import {
  ToolMetadata,
  ToolExecutionProgress,
  ToolExecutionResult,
} from '../../registry/types';
import { Dropzone } from '../common/Dropzone';
import { FileList } from '../common/FileList';
import { PageGrid } from '../common/PageGrid';
import { ProgressBar } from '../common/ProgressBar';
import { downloadBlob, formatBytes } from '../../lib/file-utils';
import { Icon } from '../common/Icon';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface ToolShellProps {
  metadata: ToolMetadata;
  execute: (
    files: File[],
    options: any,
    onProgress: (p: ToolExecutionProgress) => void
  ) => Promise<ToolExecutionResult>;
  renderOptions?: (props: {
    files: File[];
    options: any;
    setOptions: React.Dispatch<React.SetStateAction<any>>;
    disabled?: boolean;
  }) => React.ReactNode;
  initialOptions?: any;
  onBackToHome?: () => void;
}

type Stage = 'upload' | 'workspace' | 'processing' | 'result';

export const ToolShell: React.FC<ToolShellProps> = ({
  metadata,
  execute,
  renderOptions,
  initialOptions = {},
  onBackToHome,
}) => {
  const [stage, setStage] = useState<Stage>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<any>(initialOptions);
  const [progress, setProgress] = useState<ToolExecutionProgress>({
    percentage: 0,
    message: '',
  });
  const [result, setResult] = useState<ToolExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // When files are selected in Dropzone
  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles);
    setError(null);
    setStage('workspace');
  };

  // Add more files to existing queue
  const handleAddMoreFiles = (added: File[]) => {
    setFiles((prev) => [...prev, ...added]);
  };

  // Run the tool execution
  const handleExecute = async () => {
    try {
      setError(null);
      setStage('processing');
      setProgress({ percentage: 5, message: 'Initializing...' });

      const execResult = await execute(files, options, (p) => {
        setProgress(p);
      });

      setResult(execResult);
      setStage('result');
    } catch (err: any) {
      console.error('Execution error', err);
      setError(err?.message || 'An unexpected error occurred during processing');
      setStage('workspace');
    }
  };

  // Reset tool
  const handleStartOver = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setOptions(initialOptions);
    setStage('upload');
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Tool Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          <Icon name={metadata.iconName} size={14} />
          <span>{metadata.category}</span>
          {metadata.badge && (
            <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.2 rounded font-bold">
              {metadata.badge}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {metadata.name}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          {metadata.description}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Error:</span> {error}
          </div>
        </div>
      )}

      {/* STAGE 1: UPLOAD */}
      {stage === 'upload' && (
        <div className="py-6">
          <Dropzone
            onFilesSelected={handleFilesSelected}
            acceptedTypes={metadata.acceptedTypes}
            allowMultiple={metadata.allowMultiple}
            minFiles={metadata.minFiles}
            maxFiles={metadata.maxFiles}
            title={`Select ${metadata.acceptedTypes.includes('application/pdf') ? 'PDF' : 'Image'} Files`}
          />
        </div>
      )}

      {/* STAGE 2: WORKSPACE & OPTIONS */}
      {stage === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Area (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft min-h-[400px]">
            {/* Multi-file tools like Merge and JPG to PDF show FileList */}
            {(metadata.id === 'merge-pdf' || metadata.id === 'jpg-to-pdf') && (
              <FileList
                files={files}
                onReorder={setFiles}
                onRemove={(index) => {
                  const updated = files.filter((_, i) => i !== index);
                  if (updated.length === 0) {
                    handleStartOver();
                  } else {
                    setFiles(updated);
                  }
                }}
                onAddMore={handleAddMoreFiles}
                acceptedTypes={metadata.acceptedTypes}
                allowMultiple={metadata.allowMultiple}
              />
            )}

            {/* Organize PDF uses PageGrid in reorder mode */}
            {metadata.id === 'organize-pdf' && files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Document Pages (Drag to Reorder)
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {files[0].name}
                  </span>
                </div>
                <PageGrid
                  file={files[0]}
                  mode="reorder"
                  pages={options.pages || []}
                  onPagesChange={(newPages) =>
                    setOptions((prev: any) => ({ ...prev, pages: newPages }))
                  }
                />
              </div>
            )}

            {/* Remove Pages uses PageGrid with selection */}
            {metadata.id === 'remove-pages' && files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Click pages you wish to remove
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {files[0].name}
                  </span>
                </div>
                <PageGrid
                  file={files[0]}
                  mode="select"
                  selectedPageNumbers={options.pagesToRemove || []}
                  selectionBadgeText={() => 'Remove'}
                  onTogglePage={(page) => {
                    setOptions((prev: any) => {
                      const cur: number[] = prev.pagesToRemove || [];
                      const exists = cur.includes(page);
                      const updated = exists
                        ? cur.filter((p) => p !== page)
                        : [...cur, page].sort((a, b) => a - b);
                      return {
                        ...prev,
                        pagesToRemove: updated,
                        rangeString: updated.join(', '),
                      };
                    });
                  }}
                />
              </div>
            )}

            {/* Extract Pages uses PageGrid with selection */}
            {metadata.id === 'extract-pages' && files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Click pages you wish to extract
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {files[0].name}
                  </span>
                </div>
                <PageGrid
                  file={files[0]}
                  mode="select"
                  selectedPageNumbers={options.selectedPages || []}
                  selectionBadgeText={() => 'Extract'}
                  onTogglePage={(page) => {
                    setOptions((prev: any) => {
                      const cur: number[] = prev.selectedPages || [];
                      const exists = cur.includes(page);
                      const updated = exists
                        ? cur.filter((p) => p !== page)
                        : [...cur, page].sort((a, b) => a - b);
                      return {
                        ...prev,
                        selectedPages: updated,
                        rangeString: updated.join(', '),
                      };
                    });
                  }}
                />
              </div>
            )}

            {/* Single file tools (Rotate, Numbers, Watermark, Split, PDF to JPG) */}
            {![
              'merge-pdf',
              'jpg-to-pdf',
              'organize-pdf',
              'remove-pages',
              'extract-pages',
            ].includes(metadata.id) &&
              files.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {files[0].name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {formatBytes(files[0].size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartOver}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                    >
                      Change file
                    </button>
                  </div>

                  {/* Preview pages */}
                  <PageGrid file={files[0]} mode="preview" />
                </div>
              )}
          </div>

          {/* Options Sidebar (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft space-y-6 sticky top-20">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Tool Options</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure output parameters
              </p>
            </div>

            {/* Injected custom options panel */}
            {renderOptions &&
              renderOptions({
                files,
                options,
                setOptions,
              })}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecute}
                className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>{metadata.name}</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Processed locally in your browser</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: PROCESSING */}
      {stage === 'processing' && (
        <div className="py-16">
          <ProgressBar
            percentage={progress.percentage}
            message={progress.message}
          />
        </div>
      )}

      {/* STAGE 4: RESULT SCREEN */}
      {stage === 'result' && result && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-8 md:p-10 shadow-soft text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Your PDF is Ready!
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your file has been processed successfully.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-around">
            {result.stats?.outputSize && (
              <div>
                <span className="block text-slate-400 font-medium">Output Size</span>
                <span className="font-bold text-slate-800 text-sm">
                  {formatBytes(result.stats.outputSize)}
                </span>
              </div>
            )}
            {result.stats?.pageCount && (
              <div>
                <span className="block text-slate-400 font-medium">Pages</span>
                <span className="font-bold text-slate-800 text-sm">
                  {result.stats.pageCount}
                </span>
              </div>
            )}
            <div>
              <span className="block text-slate-400 font-medium">Privacy</span>
              <span className="font-bold text-emerald-600 text-sm flex items-center gap-1 justify-center">
                <ShieldCheck size={14} /> 100% Local
              </span>
            </div>
          </div>

          {/* Download Action */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              <span>Download {result.filename}</span>
            </button>

            <button
              type="button"
              onClick={handleStartOver}
              className="w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Process another document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
