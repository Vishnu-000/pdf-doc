import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { dataUrlToBlob } from '../pdf-to-jpg/logic';

export interface SignOptions {
  signatureDataUrl?: string;
  pageNumber: number; // 1-based
  position: 'bottom-right' | 'bottom-left' | 'center';
  signatureWidth?: number;
  signatureHeight?: number;
}

/**
 * Places signature image onto the specified page of a PDF buffer
 */
export async function signPdfBuffer(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  options: SignOptions
): Promise<Uint8Array> {
  const {
    signatureDataUrl,
    pageNumber = 1,
    position = 'bottom-right',
    signatureWidth = 160,
    signatureHeight = 60,
  } = options;

  if (!signatureDataUrl) {
    throw new Error('Please draw, type, or upload a signature first');
  }

  const doc = await PDFDocument.load(pdfBuffer as any);
  const totalPages = doc.getPageCount();

  const targetPageIdx = Math.max(0, Math.min(totalPages - 1, pageNumber - 1));
  const page = doc.getPage(targetPageIdx);
  const { width, height } = page.getSize();

  // Convert signature dataUrl to PNG/JPG buffer
  const blob = dataUrlToBlob(signatureDataUrl);
  const sigBuffer = await blob.arrayBuffer();

  const isPng = signatureDataUrl.startsWith('data:image/png');
  const signatureImage = isPng
    ? await doc.embedPng(sigBuffer)
    : await doc.embedJpg(sigBuffer);

  let x = width - signatureWidth - 40;
  let y = 40;

  if (position === 'bottom-left') {
    x = 40;
    y = 40;
  } else if (position === 'center') {
    x = (width - signatureWidth) / 2;
    y = (height - signatureHeight) / 2;
  }

  page.drawImage(signatureImage, {
    x,
    y,
    width: signatureWidth,
    height: signatureHeight,
  });

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeSign(
  files: File[],
  options: SignOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to sign');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Reading document...' });
  const buffer = await readFileAsArrayBuffer(file);

  onProgress({ percentage: 60, message: 'Embedding digital signature...' });
  const signedBytes = await signPdfBuffer(buffer, options);

  const blob = new Blob([signedBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Signature placed successfully!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_signed.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
