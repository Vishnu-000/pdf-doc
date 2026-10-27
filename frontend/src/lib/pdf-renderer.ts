import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker from the public folder
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface RenderedPageThumbnail {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF document from an ArrayBuffer
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Gets total page count of a PDF from an ArrayBuffer
 */
export async function getPdfPageCount(arrayBuffer: ArrayBuffer): Promise<number> {
  const doc = await loadPdfDocument(arrayBuffer);
  return doc.numPages;
}

/**
 * Renders a specific page of a PDF document to a high-quality Data URL (or thumbnail)
 * @param doc The loaded PDFDocumentProxy
 * @param pageNumber 1-based page number
 * @param scale Render scale (e.g. 0.4 for thumbnail, 1.5 - 2.0 for high-res export)
 * @param imageFormat 'image/jpeg' or 'image/png'
 * @param quality Quality (0.0 to 1.0)
 */
export async function renderPdfPageToDataUrl(
  doc: any,
  pageNumber: number,
  scale: number = 0.5,
  imageFormat: string = 'image/jpeg',
  quality: number = 0.85
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D canvas context');
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Fill white background for JPEGs
  if (imageFormat === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL(imageFormat, quality);
  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Render all page thumbnails of a PDF document
 */
export async function renderAllThumbnails(
  arrayBuffer: ArrayBuffer,
  scale: number = 0.35,
  onProgress?: (current: number, total: number) => void
): Promise<RenderedPageThumbnail[]> {
  const doc = await loadPdfDocument(arrayBuffer);
  const total = doc.numPages;
  const thumbnails: RenderedPageThumbnail[] = [];

  for (let i = 1; i <= total; i++) {
    const { dataUrl, width, height } = await renderPdfPageToDataUrl(
      doc,
      i,
      scale,
      'image/jpeg',
      0.8
    );
    thumbnails.push({
      pageIndex: i - 1, // 0-based
      dataUrl,
      width,
      height,
    });
    if (onProgress) {
      onProgress(i, total);
    }
  }

  return thumbnails;
}
