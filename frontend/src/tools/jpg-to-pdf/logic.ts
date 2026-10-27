import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';

export interface JpgToPdfOptions {
  pageOrientation: 'portrait' | 'landscape' | 'auto';
  pageSize: 'fit' | 'a4' | 'letter';
  margin: 'none' | 'small' | 'big';
}

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

const MARGIN_SIZES = {
  none: 0,
  small: 20,
  big: 40,
};

/**
 * Checks if buffer is PNG by inspecting magic bytes
 */
function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

/**
 * Converts image buffers (JPEG/PNG) to a single PDF
 */
export async function convertImagesToPdf(
  images: { buffer: ArrayBuffer | ArrayBufferLike; name?: string }[],
  options: Partial<JpgToPdfOptions> = {},
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const {
    pageOrientation = 'auto',
    pageSize = 'a4',
    margin = 'small',
  } = options;

  const doc = await PDFDocument.create();
  const marginPt = MARGIN_SIZES[margin];
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const item = images[i];
    const u8 = new Uint8Array(item.buffer);
    const embeddedImage = isPng(u8)
      ? await doc.embedPng(item.buffer as any)
      : await doc.embedJpg(item.buffer as any);

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = 0;
    let pageHeight = 0;

    if (pageSize === 'fit') {
      pageWidth = imgWidth + marginPt * 2;
      pageHeight = imgHeight + marginPt * 2;
    } else {
      const baseDim = PAGE_SIZES[pageSize];
      let isLandscape = false;
      if (pageOrientation === 'auto') {
        isLandscape = imgWidth > imgHeight;
      } else {
        isLandscape = pageOrientation === 'landscape';
      }

      pageWidth = isLandscape ? baseDim.height : baseDim.width;
      pageHeight = isLandscape ? baseDim.width : baseDim.height;
    }

    const page = doc.addPage([pageWidth, pageHeight]);

    // Printable area
    const availableWidth = pageWidth - marginPt * 2;
    const availableHeight = pageHeight - marginPt * 2;

    // Scale image while preserving aspect ratio
    const scale = Math.min(
      availableWidth / imgWidth,
      availableHeight / imgHeight
    );

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // Center image
    const x = marginPt + (availableWidth - drawWidth) / 2;
    const y = marginPt + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeJpgToPdf(
  files: File[],
  options: JpgToPdfOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select at least one image file');
  }

  const items: { buffer: ArrayBuffer; name: string }[] = [];
  let totalOriginalSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    totalOriginalSize += file.size;
    onProgress({
      percentage: Math.round(((i + 1) / files.length) * 30),
      message: `Reading image ${i + 1} of ${files.length}...`,
    });
    const buffer = await readFileAsArrayBuffer(file);
    items.push({ buffer, name: file.name });
  }

  onProgress({ percentage: 40, message: 'Creating PDF pages from images...' });
  const pdfBytes = await convertImagesToPdf(items, options, (cur, tot) => {
    onProgress({
      percentage: 40 + Math.round((cur / tot) * 55),
      message: `Embedding image ${cur} of ${tot}...`,
    });
  });

  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: 'images_converted.pdf',
    mimeType: 'application/pdf',
    stats: {
      originalSize: totalOriginalSize,
      outputSize: blob.size,
      fileCount: files.length,
    },
  };
}
