import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer, parsePageRange } from '../../lib/file-utils';

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export type PageNumberFormat = 'page_n' | 'page_n_of_total' | 'n';

export interface PageNumbersOptions {
  format: PageNumberFormat;
  position: PageNumberPosition;
  fontSize: number;
  margin: number;
  startFrom: number;
  customRange?: string;
}

/**
 * Adds page numbers to PDF buffer
 */
export async function addPageNumbersToPdf(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  options: Partial<PageNumbersOptions> = {}
): Promise<Uint8Array> {
  const {
    format = 'page_n_of_total',
    position = 'bottom-center',
    fontSize = 10,
    margin = 25,
    startFrom = 1,
    customRange = '',
  } = options;

  const doc = await PDFDocument.load(pdfBuffer as any);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const total = doc.getPageCount();

  const activePages = customRange.trim()
    ? new Set(parsePageRange(customRange, total))
    : null;

  for (let i = 0; i < total; i++) {
    const pageNum = i + 1;
    if (activePages && !activePages.has(pageNum)) {
      continue;
    }

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const currentNumber = startFrom + i;

    let text = `${currentNumber}`;
    if (format === 'page_n') {
      text = `Page ${currentNumber}`;
    } else if (format === 'page_n_of_total') {
      text = `Page ${currentNumber} of ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    let x = (width - textWidth) / 2;
    let y = margin;

    // Horizontal position
    if (position.includes('left')) {
      x = margin;
    } else if (position.includes('right')) {
      x = width - margin - textWidth;
    } else {
      x = (width - textWidth) / 2;
    }

    // Vertical position
    if (position.includes('top')) {
      y = height - margin - textHeight;
    } else {
      y = margin;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executePageNumbers(
  files: File[],
  options: PageNumbersOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);

  onProgress({ percentage: 60, message: 'Drawing page numbers...' });
  const modifiedBytes = await addPageNumbersToPdf(buffer, options);
  const blob = new Blob([modifiedBytes as BlobPart], { type: 'application/pdf' });

  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_numbered.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
