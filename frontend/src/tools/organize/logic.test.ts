import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { organizePdfPages } from './logic';

describe('Organize PDF Tool', () => {
  it('reorders and duplicates pages according to custom configuration', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]); // Page 0
    doc.addPage([200, 200]); // Page 1
    doc.addPage([300, 300]); // Page 2
    const bytes = await doc.save();

    // Reorder as [2, 0, 0] (page 2, page 0, duplicate page 0 with rotation 90)
    const resultBytes = await organizePdfPages(bytes.buffer, [
      { id: '1', originalPageIndex: 2, rotation: 0 },
      { id: '2', originalPageIndex: 0, rotation: 0 },
      { id: '3', originalPageIndex: 0, rotation: 90 },
    ]);

    const resultDoc = await PDFDocument.load(resultBytes);
    expect(resultDoc.getPageCount()).toBe(3);

    // Verify first page width is 300 (original page 2)
    expect(resultDoc.getPage(0).getWidth()).toBe(300);
    // Verify third page rotation is 90
    expect(resultDoc.getPage(2).getRotation().angle).toBe(90);
  });
});
