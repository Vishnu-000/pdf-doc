import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { extractPagesToSinglePdf, extractPagesToSeparateEntries } from './logic';

describe('Extract Pages Tool', () => {
  async function makeTestPdf(pageCount: number): Promise<ArrayBuffer> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([150, 150]);
    }
    const bytes = await doc.save();
    return bytes.buffer as ArrayBuffer;
  }

  it('extracts selected pages into a single PDF', async () => {
    const buffer = await makeTestPdf(5);
    const resultBytes = await extractPagesToSinglePdf(buffer, [1, 3, 5]);
    const resultDoc = await PDFDocument.load(resultBytes);

    expect(resultDoc.getPageCount()).toBe(3);
  });

  it('extracts selected pages into separate zip entries', async () => {
    const buffer = await makeTestPdf(5);
    const entries = await extractPagesToSeparateEntries(buffer, [2, 4]);

    expect(entries.length).toBe(2);
    expect(entries[0].filename).toBe('page_2.pdf');
    expect(entries[1].filename).toBe('page_4.pdf');
  });
});
