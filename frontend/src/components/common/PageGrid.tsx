import React, { useEffect, useState } from 'react';
import { renderAllThumbnails, RenderedPageThumbnail } from '../../lib/pdf-renderer';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { PageOrderItem } from '../../tools/organize/logic';
import {
  RotateCw,
  Trash2,
  Copy,
  CheckCircle2,
  Loader2,
  GripVertical,
} from 'lucide-react';

interface PageGridProps {
  file: File;
  mode?: 'reorder' | 'select' | 'preview';
  // Reorder mode state
  pages?: PageOrderItem[];
  onPagesChange?: (pages: PageOrderItem[]) => void;
  // Select mode state (for remove / extract)
  selectedPageNumbers?: number[]; // 1-based
  onTogglePage?: (pageNumber: number) => void;
  selectionBadgeText?: (pageNumber: number) => string;
}

export const PageGrid: React.FC<PageGridProps> = ({
  file,
  mode = 'preview',
  pages = [],
  onPagesChange,
  selectedPageNumbers = [],
  onTogglePage,
  selectionBadgeText,
}) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [progressText, setProgressText] = useState<string>('Loading PDF...');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadThumbnails() {
      try {
        setLoading(true);
        const buffer = await readFileAsArrayBuffer(file);
        const thumbs = await renderAllThumbnails(buffer, 0.4, (cur, total) => {
          if (isMounted) {
            setProgressText(`Rendering page ${cur} of ${total}...`);
          }
        });

        if (isMounted) {
          const map: Record<number, string> = {};
          thumbs.forEach((t) => {
            map[t.pageIndex] = t.dataUrl;
          });
          setThumbnails(map);
          setLoading(false);

          // If pages array is empty and onPagesChange provided, initialize default sequence
          if (onPagesChange && pages.length === 0) {
            const initial: PageOrderItem[] = thumbs.map((t) => ({
              id: `page-${t.pageIndex}-${Date.now()}-${Math.random()}`,
              originalPageIndex: t.pageIndex,
              rotation: 0,
            }));
            onPagesChange(initial);
          }
        }
      } catch (err) {
        console.error('Failed to render PDF thumbnails', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadThumbnails();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Drag and drop handlers for reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || !onPagesChange) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onPagesChange(reordered);
    setDraggedIndex(null);
  };

  // Rotate single page
  const handleRotatePage = (index: number) => {
    if (!onPagesChange) return;
    const updated = [...pages];
    updated[index] = {
      ...updated[index],
      rotation: (updated[index].rotation + 90) % 360,
    };
    onPagesChange(updated);
  };

  // Duplicate single page
  const handleDuplicatePage = (index: number) => {
    if (!onPagesChange) return;
    const target = pages[index];
    const updated = [...pages];
    updated.splice(index + 1, 0, {
      ...target,
      id: `page-${target.originalPageIndex}-${Date.now()}-${Math.random()}`,
    });
    onPagesChange(updated);
  };

  // Delete single page
  const handleDeletePage = (index: number) => {
    if (!onPagesChange || pages.length <= 1) return;
    const updated = pages.filter((_, i) => i !== index);
    onPagesChange(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
        <Loader2 size={36} className="text-brand-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">{progressText}</p>
        <p className="text-xs text-slate-400 mt-1">Generating high-quality page previews...</p>
      </div>
    );
  }

  // If in reorder mode (Organize PDF)
  if (mode === 'reorder') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((item, index) => {
          const thumbUrl = thumbnails[item.originalPageIndex];
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`relative bg-white rounded-xl border p-2 flex flex-col items-center transition-all duration-200 select-none group cursor-grab active:cursor-grabbing ${
                draggedIndex === index
                  ? 'opacity-40 border-dashed border-brand-500 scale-95'
                  : 'border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Action overlay on hover */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-900/80 p-1 rounded-lg backdrop-blur-xs">
                <button
                  type="button"
                  title="Rotate 90° clockwise"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotatePage(index);
                  }}
                  className="p-1 text-white hover:text-brand-300 transition-colors"
                >
                  <RotateCw size={13} />
                </button>
                <button
                  type="button"
                  title="Duplicate page"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicatePage(index);
                  }}
                  className="p-1 text-white hover:text-brand-300 transition-colors"
                >
                  <Copy size={13} />
                </button>
                {pages.length > 1 && (
                  <button
                    type="button"
                    title="Remove page"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(index);
                    }}
                    className="p-1 text-white hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Thumbnail Container */}
              <div className="w-full aspect-[1/1.4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1.5 border border-slate-100">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`Page ${index + 1}`}
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 pointer-events-none shadow-xs rounded"
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Page {index + 1}</span>
                )}
              </div>

              {/* Bottom Label */}
              <div className="w-full flex items-center justify-between mt-2 px-1">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {index + 1}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-medium">
                  <GripVertical size={11} /> Drag
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Selection mode (Remove Pages or Extract Pages)
  const totalOriginalPages = Object.keys(thumbnails).length;
  const pageNumbers = Array.from({ length: totalOriginalPages }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pageNumbers.map((pageNum) => {
        const pageIndex = pageNum - 1;
        const thumbUrl = thumbnails[pageIndex];
        const isSelected = selectedPageNumbers.includes(pageNum);
        const badge = selectionBadgeText ? selectionBadgeText(pageNum) : null;

        return (
          <div
            key={pageNum}
            onClick={() => onTogglePage && onTogglePage(pageNum)}
            className={`relative bg-white rounded-xl border p-2 flex flex-col items-center cursor-pointer transition-all duration-200 select-none ${
              isSelected
                ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-sm opacity-90'
            }`}
          >
            {/* Selection Checkmark */}
            <div
              className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white/80 border border-slate-300 text-transparent hover:border-brand-400'
              }`}
            >
              <CheckCircle2 size={16} />
            </div>

            {/* Thumbnail */}
            <div className="w-full aspect-[1/1.4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1.5 border border-slate-100">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={`Page ${pageNum}`}
                  className="max-w-full max-h-full object-contain pointer-events-none shadow-xs rounded"
                />
              ) : (
                <span className="text-xs text-slate-400 font-medium">Page {pageNum}</span>
              )}
            </div>

            {/* Bottom Info */}
            <div className="w-full flex items-center justify-between mt-2 px-1">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Page {pageNum}
              </span>
              {badge && (
                <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
