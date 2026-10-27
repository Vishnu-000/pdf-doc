import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer, parsePageRange } from '../../lib/file-utils';

export interface RemovePagesOptions {
  pagesToRemove?: number[];
  rangeString?: string;
}

/**
 * Removes specified 1-based page numbers from a PDF buffer
 */
export async function removePdfPages(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  pagesToRemove: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const newDoc = await PDFDocument.create();
  const totalPages = srcDoc.getPageCount();

  const removeSet = new Set(pagesToRemove);
  const keepIndices: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (!removeSet.has(i)) {
      keepIndices.push(i - 1);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot remove all pages from the document');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeRemovePages(
  files: File[],
  options: RemovePagesOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  let toRemove = options.pagesToRemove || [];
  if (options.rangeString) {
    toRemove = parsePageRange(options.rangeString, totalPages);
  }

  if (toRemove.length === 0) {
    throw new Error('Please specify at least one page to remove');
  }

  if (toRemove.length >= totalPages) {
    throw new Error('You cannot remove all pages from the document');
  }

  onProgress({ percentage: 50, message: `Removing ${toRemove.length} pages...` });
  const modifiedBytes = await removePdfPages(buffer, toRemove);
  const blob = new Blob([modifiedBytes as BlobPart], { type: 'application/pdf' });

  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_pages_removed.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
      pageCount: totalPages - toRemove.length,
    },
  };
}
