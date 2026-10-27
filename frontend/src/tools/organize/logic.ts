import { PDFDocument, degrees } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';

export interface PageOrderItem {
  id: string;
  originalPageIndex: number; // 0-based
  rotation: number; // 0, 90, 180, 270
}

export interface OrganizeOptions {
  pages: PageOrderItem[];
}

/**
 * Re-assembles PDF pages according to specified order and rotations
 */
export async function organizePdfPages(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  items: PageOrderItem[],
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  if (items.length === 0) {
    throw new Error('At least one page must be included in the organized document');
  }

  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const newDoc = await PDFDocument.create();
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const [copiedPage] = await newDoc.copyPages(srcDoc, [item.originalPageIndex]);

    if (item.rotation) {
      const currentAngle = copiedPage.getRotation().angle;
      const targetAngle = (currentAngle + item.rotation) % 360;
      copiedPage.setRotation(degrees(targetAngle));
    }

    newDoc.addPage(copiedPage);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return await newDoc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeOrganize(
  files: File[],
  options: OrganizeOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to organize');
  }

  const file = files[0];
  onProgress({ percentage: 10, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);

  if (!options.pages || options.pages.length === 0) {
    throw new Error('No pages configured for output');
  }

  onProgress({ percentage: 30, message: 'Reorganizing pages...' });
  const organizedBytes = await organizePdfPages(buffer, options.pages, (cur, total) => {
    onProgress({
      percentage: 30 + Math.round((cur / total) * 60),
      message: `Assembling page ${cur} of ${total}...`,
    });
  });

  const blob = new Blob([organizedBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_organized.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
      pageCount: options.pages.length,
    },
  };
}
