import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer, parsePageRange } from '../../lib/file-utils';
import { createZipArchive, ZipEntry } from '../../lib/zip-utils';

export interface SplitOptions {
  mode: 'range' | 'all';
  rangeString?: string;
  outputName?: string;
}

/**
 * Splits a PDF by page range (1-based indices) into a new single PDF
 */
export async function splitPdfByRange(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const newDoc = await PDFDocument.create();
  const totalPages = srcDoc.getPageCount();

  // Convert 1-based page numbers to 0-based indices and validate
  const validIndices = pageNumbers
    .filter((p) => p >= 1 && p <= totalPages)
    .map((p) => p - 1);

  if (validIndices.length === 0) {
    throw new Error('No valid pages selected for split');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Splits every page of a PDF into an individual PDF file
 */
export async function splitAllPages(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  onProgress?: (current: number, total: number) => void
): Promise<ZipEntry[]> {
  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const total = srcDoc.getPageCount();
  const entries: ZipEntry[] = [];

  for (let i = 0; i < total; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(srcDoc, [i]);
    singleDoc.addPage(page);
    const pdfBytes = await singleDoc.save();

    entries.push({
      filename: `page_${i + 1}.pdf`,
      content: pdfBytes,
    });

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return entries;
}

/**
 * Main execution handler for ToolShell
 */
export async function executeSplit(
  files: File[],
  options: SplitOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to split');
  }

  const file = files[0];
  onProgress({ percentage: 10, message: 'Loading PDF document...' });
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  if (options.mode === 'all') {
    onProgress({ percentage: 25, message: `Extracting ${totalPages} pages...` });
    const entries = await splitAllPages(buffer, (cur, tot) => {
      onProgress({
        percentage: 25 + Math.round((cur / tot) * 50),
        message: `Extracted page ${cur} of ${tot}...`,
      });
    });

    onProgress({ percentage: 80, message: 'Creating ZIP archive...' });
    const zipBlob = await createZipArchive(entries, (p) => {
      onProgress({ percentage: 80 + Math.round(p * 0.19), message: 'Compressing archive...' });
    });

    return {
      blob: zipBlob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}_split_pages.zip`,
      mimeType: 'application/zip',
      stats: {
        originalSize: file.size,
        outputSize: zipBlob.size,
        pageCount: totalPages,
      },
    };
  } else {
    // Mode 'range'
    const pages = parsePageRange(options.rangeString || `1-${totalPages}`, totalPages);
    if (pages.length === 0) {
      throw new Error('Please specify a valid page range (e.g. 1-3, 5)');
    }

    onProgress({ percentage: 50, message: `Extracting pages: ${pages.join(', ')}...` });
    const splitBytes = await splitPdfByRange(buffer, pages);
    const pdfBlob = new Blob([splitBytes as BlobPart], { type: 'application/pdf' });

    return {
      blob: pdfBlob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}_split.pdf`,
      mimeType: 'application/pdf',
      stats: {
        originalSize: file.size,
        outputSize: pdfBlob.size,
        pageCount: pages.length,
      },
    };
  }
}
