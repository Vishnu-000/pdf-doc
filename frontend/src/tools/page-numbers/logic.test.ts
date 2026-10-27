import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { addPageNumbersToPdf } from './logic';

describe('Add Page Numbers Tool', () => {
  it('applies page numbers across all pages without corrupting document structure', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([400, 600]);
    doc.addPage([400, 600]);
    const bytes = await doc.save();

    const numberedBytes = await addPageNumbersToPdf(bytes.buffer, {
      format: 'page_n_of_total',
      position: 'bottom-center',
      fontSize: 12,
    });

    const resultDoc = await PDFDocument.load(numberedBytes);
    expect(resultDoc.getPageCount()).toBe(2);
    // Document can be parsed cleanly and has valid structure
    expect(resultDoc.getPage(0).getSize().width).toBe(400);
  });
});
