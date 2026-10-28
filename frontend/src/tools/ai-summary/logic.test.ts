import { describe, it, expect } from 'vitest';
import { analyzeDocumentText, createSummaryPdf } from './logic';
import { PDFDocument } from 'pdf-lib';

describe('AI Document Chat & Summarizer Tool', () => {
  const samplePages = [
    {
      pageNumber: 1,
      text: 'Introduction to Artificial Intelligence. Machine learning systems analyze large datasets to uncover hidden patterns. Recent innovations show a 45 percent increase in computational performance across neural network architectures.',
    },
    {
      pageNumber: 2,
      text: 'Methodology and Evaluation. We tested the pipeline on benchmark benchmarks across multiple domains. The final accuracy reached 98 percent, demonstrating robust resilience under edge computing conditions.',
    },
  ];

  it('correctly calculates metrics and generates executive summary and key takeaways', () => {
    const analysis = analyzeDocumentText(samplePages);
    expect(analysis.pageCount).toBe(2);
    expect(analysis.wordCount).toBeGreaterThan(20);
    expect(analysis.executiveSummary.length).toBeGreaterThan(10);
    expect(analysis.keyTakeaways.length).toBeGreaterThan(0);
    expect(analysis.keyTakeaways[0]).toContain('[Page');
  });

  it('accurately answers questions with relevant sentence and page citation', () => {
    const analysis = analyzeDocumentText(samplePages, 'accuracy reached');
    expect(analysis.answeredQuestion).toBeDefined();
    expect(analysis.answeredQuestion?.answer).toContain('98 percent');
    expect(analysis.answeredQuestion?.pageReference).toBe(2);
  });

  it('generates a valid, readable summary PDF report', async () => {
    const analysis = analyzeDocumentText(samplePages, 'neural network');
    const pdfBytes = await createSummaryPdf('sample.pdf', analysis, 'executive');
    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.byteLength).toBeGreaterThan(0);

    const loadedDoc = await PDFDocument.load(pdfBytes);
    expect(loadedDoc.getPageCount()).toBe(1);
  });
});
