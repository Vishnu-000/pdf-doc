import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { splitPdfByRange, splitAllPages } from './logic';

describe('Split PDF Tool', () => {
  async function createTestDoc(pageCount: number): Promise<ArrayBuffer> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([200, 200]);
    }
    const bytes = await doc.save();
    return bytes.buffer as ArrayBuffer;
  }

  it('extracts specific pages according to range', async () => {
    const buffer = await createTestDoc(6);
    // Extract pages 2, 4, 5
    const splitBytes = await splitPdfByRange(buffer, [2, 4, 5]);
    const splitDoc = await PDFDocument.load(splitBytes);

    expect(splitDoc.getPageCount()).toBe(3);
  });

  it('splits all pages into individual zip entries', async () => {
    const buffer = await createTestDoc(4);
    const entries = await splitAllPages(buffer);

    expect(entries.length).toBe(4);
    expect(entries[0].filename).toBe('page_1.pdf');
    expect(entries[3].filename).toBe('page_4.pdf');

    // Load first entry to verify it's a valid single-page PDF
    const firstDoc = await PDFDocument.load(entries[0].content as Uint8Array);
    expect(firstDoc.getPageCount()).toBe(1);
  });
});
