import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number; // 0.1 to 1.0
  rotation: number; // -90 to 90
  color: 'gray' | 'red' | 'blue';
  position: 'center' | 'diagonal';
}

/**
 * Adds text watermark to PDF buffer
 */
export async function addWatermarkToPdf(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  options: Partial<WatermarkOptions> = {}
): Promise<Uint8Array> {
  const {
    text = 'CONFIDENTIAL',
    fontSize = 48,
    opacity = 0.35,
    rotation = 45,
    color = 'gray',
  } = options;

  if (!text.trim()) {
    throw new Error('Watermark text cannot be empty');
  }

  const doc = await PDFDocument.load(pdfBuffer as any);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const total = doc.getPageCount();

  let textColor = rgb(0.5, 0.5, 0.5);
  if (color === 'red') {
    textColor = rgb(0.85, 0.15, 0.15);
  } else if (color === 'blue') {
    textColor = rgb(0.1, 0.35, 0.85);
  }

  for (let i = 0; i < total; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Approximate centered positioning with rotation
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const x = (width - (textWidth * cos - textHeight * sin)) / 2;
    const y = (height - (textWidth * sin + textHeight * cos)) / 2;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: textColor,
      opacity: Math.max(0.05, Math.min(1.0, opacity)),
      rotate: degrees(rotation),
    });
  }

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeWatermark(
  files: File[],
  options: WatermarkOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);

  onProgress({ percentage: 60, message: 'Applying watermark...' });
  const modifiedBytes = await addWatermarkToPdf(buffer, options);
  const blob = new Blob([modifiedBytes as BlobPart], { type: 'application/pdf' });

  onProgress({ percentage: 100, message: 'Done!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_watermarked.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
