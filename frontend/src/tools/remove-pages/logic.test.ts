import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { removePdfPages } from './logic';

describe('Remove Pages Tool', () => {
  it('correctly removes selected pages from a document', async () => {
    const doc = await PDFDocument.create();
    // Add 5 pages
    for (let i = 0; i < 5; i++) {
      doc.addPage([200, 200]);
    }
    const bytes = await doc.save();

    // Remove pages 2 and 4 (leaving 3 pages: 1, 3, 5)
    const modifiedBytes = await removePdfPages(bytes.buffer, [2, 4]);
    const resultDoc = await PDFDocument.load(modifiedBytes);

    expect(resultDoc.getPageCount()).toBe(3);
  });

  it('throws an error if attempting to remove all pages', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    const bytes = await doc.save();

    await expect(removePdfPages(bytes.buffer, [1])).rejects.toThrow(
      'Cannot remove all pages from the document'
    );
  });
});
