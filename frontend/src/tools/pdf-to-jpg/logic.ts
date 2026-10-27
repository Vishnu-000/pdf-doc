import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { loadPdfDocument, renderPdfPageToDataUrl } from '../../lib/pdf-renderer';
import { createZipArchive, ZipEntry } from '../../lib/zip-utils';

export interface PdfToJpgOptions {
  imageFormat: 'jpeg' | 'png';
  quality: 'normal' | 'high';
}

/**
 * Converts a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Execution handler for ToolShell
 */
export async function executePdfToJpg(
  files: File[],
  options: PdfToJpgOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to convert');
  }

  const file = files[0];
  onProgress({ percentage: 10, message: 'Loading PDF document...' });
  const buffer = await readFileAsArrayBuffer(file);
  const doc = await loadPdfDocument(buffer);
  const total = doc.numPages;

  const mimeType = options.imageFormat === 'png' ? 'image/png' : 'image/jpeg';
  const ext = options.imageFormat === 'png' ? 'png' : 'jpg';
  const scale = options.quality === 'high' ? 2.0 : 1.4;

  const imageEntries: { filename: string; blob: Blob; dataUrl: string }[] = [];

  for (let i = 1; i <= total; i++) {
    onProgress({
      percentage: 15 + Math.round((i / total) * 70),
      message: `Rendering page ${i} of ${total} (${options.quality} quality)...`,
    });

    const { dataUrl } = await renderPdfPageToDataUrl(
      doc,
      i,
      scale,
      mimeType,
      options.quality === 'high' ? 0.95 : 0.85
    );

    const blob = dataUrlToBlob(dataUrl);
    imageEntries.push({
      filename: `page_${i}.${ext}`,
      blob,
      dataUrl,
    });
  }

  if (total === 1) {
    onProgress({ percentage: 100, message: 'Conversion complete!' });
    const single = imageEntries[0];
    return {
      blob: single.blob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}.${ext}`,
      mimeType,
      previewUrl: single.dataUrl,
      stats: {
        originalSize: file.size,
        outputSize: single.blob.size,
        pageCount: 1,
      },
    };
  } else {
    onProgress({ percentage: 88, message: 'Creating ZIP file with all images...' });
    const zipEntries: ZipEntry[] = imageEntries.map((e) => ({
      filename: e.filename,
      content: e.blob,
    }));

    const zipBlob = await createZipArchive(zipEntries);
    onProgress({ percentage: 100, message: 'Complete!' });

    return {
      blob: zipBlob,
      filename: `${file.name.replace(/\.[^/.]+$/, '')}_images.zip`,
      mimeType: 'application/zip',
      previewUrl: imageEntries[0].dataUrl,
      stats: {
        originalSize: file.size,
        outputSize: zipBlob.size,
        pageCount: total,
      },
    };
  }
}
