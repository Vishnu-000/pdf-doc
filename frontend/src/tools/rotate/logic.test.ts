import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { rotatePdfPages } from './logic';

describe('Rotate PDF Tool', () => {
  it('rotates all pages by 90 degrees', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    doc.addPage([200, 200]);
    const bytes = await doc.save();

    const rotatedBytes = await rotatePdfPages(bytes.buffer, 90);
    const resultDoc = await PDFDocument.load(rotatedBytes);

    expect(resultDoc.getPage(0).getRotation().angle).toBe(90);
    expect(resultDoc.getPage(1).getRotation().angle).toBe(90);
  });

  it('rotates only specified page numbers', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    doc.addPage([200, 200]);
    const bytes = await doc.save();

    // Rotate only page 2 by 180 degrees
    const rotatedBytes = await rotatePdfPages(bytes.buffer, 180, [2]);
    const resultDoc = await PDFDocument.load(rotatedBytes);

    expect(resultDoc.getPage(0).getRotation().angle).toBe(0);
    expect(resultDoc.getPage(1).getRotation().angle).toBe(180);
  });
});
