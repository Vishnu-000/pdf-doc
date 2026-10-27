import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfBuffers } from './logic';

describe('Merge PDF Tool', () => {
  it('combines multiple PDF buffers into a single document with correct page count', async () => {
    // Create doc1 with 2 pages
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);
    doc1.addPage([200, 200]);
    const bytes1 = await doc1.save();

    // Create doc2 with 3 pages
    const doc2 = await PDFDocument.create();
    doc2.addPage([200, 200]);
    doc2.addPage([200, 200]);
    doc2.addPage([200, 200]);
    const bytes2 = await doc2.save();

    const mergedBytes = await mergePdfBuffers([bytes1.buffer, bytes2.buffer]);
    const mergedDoc = await PDFDocument.load(mergedBytes);

    expect(mergedDoc.getPageCount()).toBe(5);
  });
});
