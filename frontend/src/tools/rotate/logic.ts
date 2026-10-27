import { PDFDocument, degrees } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer, parsePageRange } from '../../lib/file-utils';

export interface RotateOptions {
  angle: 90 | 180 | 270;
  scope: 'all' | 'custom';
  customRange?: string;
}

/**
 * Rotates specified pages in a PDF buffer
 */
export async function rotatePdfPages(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  angle: number,
  pageNumbers?: number[] // 1-based. If omitted, rotates all pages
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer as any);
  const total = doc.getPageCount();

  const targetSet = pageNumbers ? new Set(pageNumbers) : null;

  for (let i = 1; i <= total; i++) {
    if (!targetSet || targetSet.has(i)) {
      const page = doc.getPage(i - 1);
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angle) % 360;
      page.setRotation(degrees(newRotation));
    }
  }

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeRotate(
  files: File[],
  options: RotateOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to rotate');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  let targetPages: number[] | undefined = undefined;
  if (options.scope === 'custom' && options.customRange) {
    targetPages = parsePageRange(options.customRange, totalPages);
  }

  onProgress({ percentage: 50, message: `Rotating pages by ${options.angle}°...` });
  const rotatedBytes = await rotatePdfPages(buffer, options.angle, targetPages);
  const blob = new Blob([rotatedBytes as BlobPart], { type: 'application/pdf' });

  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_rotated.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
      pageCount: totalPages,
    },
  };
}
