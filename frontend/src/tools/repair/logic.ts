import { PDFDocument } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { loadPdfDocument, renderPdfPageToDataUrl } from '../../lib/pdf-renderer';
import { dataUrlToBlob } from '../pdf-to-jpg/logic';

export type RepairMode = 'standard' | 'deep';

export interface RepairOptions {
  mode: RepairMode;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Reconstructs a corrupted or damaged PDF buffer
 */
export async function repairPdfBuffer(
  pdfBuffer: ArrayBuffer,
  mode: RepairMode = 'standard',
  onProgress?: (message: string, percent: number) => void
): Promise<Uint8Array> {
  // Mode 1: Standard Rebuild (Rebuilds xref, normalizes trailers, removes corrupt objects)
  if (mode === 'standard') {
    onProgress?.('Scanning cross-reference table and dictionary structure...', 30);
    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });

      onProgress?.('Reconstructing clean page tree and deflating streams...', 60);
      const newDoc = await PDFDocument.create();
      const pageCount = srcDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

      for (const page of copiedPages) {
        newDoc.addPage(page);
      }

      onProgress?.('Writing rebuilt PDF xref index...', 90);
      return await newDoc.save();
    } catch (err) {
      console.warn('Standard repair could not parse all streams, escalating to deep recovery:', err);
      mode = 'deep';
    }
  }

  // Mode 2: Deep Structure Recovery via tolerant rendering engine
  onProgress?.('Initializing deep recovery engine...', 35);
  const doc = await loadPdfDocument(pdfBuffer as any);
  const total = doc.numPages;

  if (total === 0) {
    throw new Error('Unable to recover any readable pages from this document.');
  }

  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= total; i++) {
    onProgress?.(`Recovering and re-indexing page ${i} of ${total}...`, 35 + Math.round((i / total) * 55));
    const { dataUrl, width, height } = await renderPdfPageToDataUrl(
      doc,
      i,
      1.5,
      'image/jpeg',
      0.92
    );

    const blob = dataUrlToBlob(dataUrl);
    const imgBuffer = await blob.arrayBuffer();
    const embeddedImg = await newDoc.embedJpg(imgBuffer);

    const page = newDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  onProgress?.('Finalizing rebuilt document structure...', 95);
  return await newDoc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeRepair(
  files: File[],
  options: RepairOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to repair');
  }

  const file = files[0];
  onProgress({ percentage: 10, message: 'Analyzing document integrity...' });

  const buffer = await readFileAsArrayBuffer(file);
  const repairedBytes = await repairPdfBuffer(
    buffer,
    options.mode || 'standard',
    (message, percent) => {
      onProgress({ percentage: percent, message });
    }
  );

  const blob = new Blob([repairedBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Document successfully repaired!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_repaired.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
