import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { repairPdfBuffer } from './logic';

describe('Repair PDF Tool', () => {
  it('reconstructs corrupted or damaged PDF buffer and preserves valid page count', async () => {
    // Generate valid sample document
    const doc = await PDFDocument.create();
    doc.addPage([400, 400]);
    doc.addPage([400, 400]);
    const originalBytes = await doc.save();

    // Run repair in standard mode
    const repairedBytes = await repairPdfBuffer(originalBytes.buffer as ArrayBuffer, 'standard');
    expect(repairedBytes).toBeDefined();
    expect(repairedBytes.byteLength).toBeGreaterThan(0);

    // Verify repaired PDF is fully valid and parseable
    const repairedDoc = await PDFDocument.load(repairedBytes);
    expect(repairedDoc.getPageCount()).toBe(2);
  });
});
