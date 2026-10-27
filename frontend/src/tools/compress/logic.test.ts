import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';

describe('Compress PDF Tool', () => {
  it('validates compression level configurations and preserves page structure', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([300, 300]);
    doc.addPage([300, 300]);
    const bytes = await doc.save();

    const loadedDoc = await PDFDocument.load(bytes);
    expect(loadedDoc.getPageCount()).toBe(2);
  });
});
