import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';

export interface MergeOptions {
  outputFileName?: string;
}

/**
 * Merges multiple PDF buffers into a single PDF
 */
export async function mergePdfBuffers(
  buffers: (ArrayBuffer | ArrayBufferLike)[],
  options: MergeOptions = {},
  onProgress?: (p: ToolExecutionProgress) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const total = buffers.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress({
        percentage: Math.round(((i + 0.1) / total) * 90),
        message: `Merging document ${i + 1} of ${total}...`,
      });
    }

    const srcPdf = await PDFDocument.load(buffers[i] as any);
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  if (onProgress) {
    onProgress({ percentage: 95, message: 'Finalizing PDF document...' });
  }

  const mergedPdfBytes = await mergedPdf.save();
  return mergedPdfBytes;
}

/**
 * Merge PDF execution handler for ToolShell
 */
export async function executeMerge(
  files: File[],
  options: MergeOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  const buffers: ArrayBuffer[] = [];
  let totalOriginalSize = 0;

  for (let i = 0; i < files.length; i++) {
    totalOriginalSize += files[i].size;
    onProgress({
      percentage: Math.round(((i + 1) / files.length) * 20),
      message: `Reading ${files[i].name}...`,
    });
    const buffer = await readFileAsArrayBuffer(files[i]);
    buffers.push(buffer);
  }

  const mergedBytes = await mergePdfBuffers(buffers, options, (p) => {
    onProgress({
      percentage: 20 + Math.round((p.percentage * 0.75)),
      message: p.message,
    });
  });

  const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
  const filename = options.outputFileName?.trim()
    ? (options.outputFileName.endsWith('.pdf') ? options.outputFileName : `${options.outputFileName}.pdf`)
    : 'merged_document.pdf';

  onProgress({ percentage: 100, message: 'Merge complete!' });

  return {
    blob,
    filename,
    mimeType: 'application/pdf',
    stats: {
      originalSize: totalOriginalSize,
      outputSize: blob.size,
      fileCount: files.length,
    },
  };
}
