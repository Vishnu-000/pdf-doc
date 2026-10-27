import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { signPdfBuffer } from './logic';

describe('Sign PDF Tool', () => {
  const sample1x1Png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  it('embeds signature image onto document at designated position', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([500, 500]);
    const bytes = await doc.save();

    const signedBytes = await signPdfBuffer(bytes.buffer, {
      signatureDataUrl: sample1x1Png,
      pageNumber: 1,
      position: 'bottom-right',
      signatureWidth: 100,
      signatureHeight: 40,
    });

    const resultDoc = await PDFDocument.load(signedBytes);
    expect(resultDoc.getPageCount()).toBe(1);
    expect(resultDoc.getPage(0).getWidth()).toBe(500);
  });
});
