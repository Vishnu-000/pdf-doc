import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { loadPdfDocument, renderPdfPageToDataUrl } from '../../lib/pdf-renderer';
import { dataUrlToBlob } from '../pdf-to-jpg/logic';

export type CompressionLevel = 'extreme' | 'recommended' | 'low';

export interface CompressOptions {
  level: CompressionLevel;
}

const COMPRESSION_CONFIGS: Record<
  CompressionLevel,
  { scale: number; quality: number; label: string }
> = {
  extreme: { scale: 1.0, quality: 0.65, label: 'Extreme (Smallest size, lower resolution)' },
  recommended: { scale: 1.35, quality: 0.8, label: 'Recommended (Good quality, high compression)' },
  low: { scale: 1.8, quality: 0.9, label: 'Low (Crisp quality, modest compression)' },
};

/**
 * Compresses a PDF buffer using intelligent canvas re-encoding and stream deflation
 */
export async function compressPdfBuffer(
  pdfBuffer: ArrayBuffer | ArrayBufferLike,
  level: CompressionLevel = 'recommended',
  onProgress?: (cur: number, total: number) => void
): Promise<Uint8Array> {
  const cfg = COMPRESSION_CONFIGS[level] || COMPRESSION_CONFIGS.recommended;

  // Load via pdfjs to render optimized compressed page layers
  const doc = await loadPdfDocument(pdfBuffer as any);
  const total = doc.numPages;

  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= total; i++) {
    const { dataUrl, width, height } = await renderPdfPageToDataUrl(
      doc,
      i,
      cfg.scale,
      'image/jpeg',
      cfg.quality
    );

    const blob = dataUrlToBlob(dataUrl);
    const imgBuffer = await blob.arrayBuffer();
    const embeddedImage = await newDoc.embedJpg(imgBuffer);

    // Maintain original page aspect ratio
    const page = newDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    if (onProgress) {
      onProgress(i, total);
    }
  }

  return await newDoc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeCompress(
  files: File[],
  options: CompressOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to compress');
  }

  const file = files[0];
  onProgress({ percentage: 10, message: 'Analyzing document structure...' });
  const buffer = await readFileAsArrayBuffer(file);

  onProgress({ percentage: 25, message: `Applying ${options.level} compression...` });
  const compressedBytes = await compressPdfBuffer(buffer, options.level, (cur, tot) => {
    onProgress({
      percentage: 25 + Math.round((cur / tot) * 65),
      message: `Compressing page ${cur} of ${tot}...`,
    });
  });

  const blob = new Blob([compressedBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Compression complete!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_compressed.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
