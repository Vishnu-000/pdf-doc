import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer, parsePageRange } from '../../lib/file-utils';
import { createZipArchive, ZipEntry } from '../../lib/zip-utils';

export interface ExtractPagesOptions {
  extractMode: 'single-pdf' | 'separate-pdfs';
  selectedPages?: number[];
  rangeString?: string;
}

/**
 * Extracts specified pages into a single PDF
 */
export async function extractPagesToSinglePdf(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const newDoc = await PDFDocument.create();
  const total = srcDoc.getPageCount();

  const indices = pageNumbers
    .filter((p) => p >= 1 && p <= total)
    .map((p) => p - 1);

  if (indices.length === 0) {
    throw new Error('No valid pages selected for extraction');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Extracts specified pages into separate single-page PDF entries
 */
export async function extractPagesToSeparateEntries(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  pageNumbers: number[]
): Promise<ZipEntry[]> {
  const srcDoc = await PDFDocument.load(pdfBuffer as any);
  const total = srcDoc.getPageCount();
  const entries: ZipEntry[] = [];

  const validPages = pageNumbers.filter((p) => p >= 1 && p <= total);
  if (validPages.length === 0) {
    throw new Error('No valid pages selected for extraction');
  }

  for (const pageNum of validPages) {
    const singleDoc = await PDFDocument.create();
    const [copiedPage] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
    singleDoc.addPage(copiedPage);
    const bytes = await singleDoc.save();

    entries.push({
      filename: `page_${pageNum}.pdf`,
      content: bytes,
    });
  }

  return entries;
}

/**
 * Execution handler for ToolShell
 */
export async function executeExtractPages(
  files: File[],
  options: ExtractPagesOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file');
  }

  const file = files[0];
  onProgress({ percentage: 15, message: 'Reading PDF document...' });
  const buffer = await readFileAsArrayBuffer(file);
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  let targetPages = options.selectedPages || [];
  if (options.rangeString) {
    targetPages = parsePageRange(options.rangeString, totalPages);
  }

  if (targetPages.length === 0) {
    throw new Error('Please specify at least one page to extract');
  }

  if (options.extractMode === 'separate-pdfs') {
    onProgress({ percentage: 40, message: 'Extracting pages into individual documents...' });
    const entries = await extractPagesToSeparateEntries(buffer, targetPages);

    onProgress({ percentage: 80, message: 'Creating ZIP archive...' });
    const zipBlob = await createZipArchive(entries);

    return {
      blob: zipBlob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}_extracted.zip`,
      mimeType: 'application/zip',
      stats: {
        originalSize: file.size,
        outputSize: zipBlob.size,
        pageCount: targetPages.length,
      },
    };
  } else {
    onProgress({ percentage: 50, message: 'Extracting pages into single PDF...' });
    const singlePdfBytes = await extractPagesToSinglePdf(buffer, targetPages);
    const pdfBlob = new Blob([singlePdfBytes as BlobPart], { type: 'application/pdf' });

    return {
      blob: pdfBlob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}_extracted.pdf`,
      mimeType: 'application/pdf',
      stats: {
        originalSize: file.size,
        outputSize: pdfBlob.size,
        pageCount: targetPages.length,
      },
    };
  }
}
