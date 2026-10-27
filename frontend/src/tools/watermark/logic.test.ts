import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { addWatermarkToPdf } from './logic';

describe('Watermark Tool', () => {
  it('stamps text watermark onto PDF pages', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([500, 500]);
    const bytes = await doc.save();

    const watermarkedBytes = await addWatermarkToPdf(bytes.buffer, {
      text: 'SECRET TEST',
      fontSize: 36,
      opacity: 0.5,
      rotation: 45,
      color: 'red',
    });

    const resultDoc = await PDFDocument.load(watermarkedBytes);
    expect(resultDoc.getPageCount()).toBe(1);
    expect(resultDoc.getPage(0).getWidth()).toBe(500);
  });

  it('rejects empty watermark text', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([500, 500]);
    const bytes = await doc.save();

    await expect(
      addWatermarkToPdf(bytes.buffer, { text: '   ' })
    ).rejects.toThrow('Watermark text cannot be empty');
  });
});
