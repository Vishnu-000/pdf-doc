import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { convertImagesToPdf } from './logic';

describe('JPG to PDF Tool', () => {
  // 1x1 transparent PNG base64
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  it('converts images into a multi-page PDF document', async () => {
    const pngBuffer = Buffer.from(samplePngBase64, 'base64');
    const pngArrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength
    ) as ArrayBuffer;

    const pdfBytes = await convertImagesToPdf(
      [
        { buffer: pngArrayBuffer },
        { buffer: pngArrayBuffer },
      ],
      { pageSize: 'a4', margin: 'small' }
    );

    const doc = await PDFDocument.load(pdfBytes);
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
  });
});
