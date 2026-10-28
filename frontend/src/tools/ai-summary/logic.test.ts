import { describe, it, expect } from 'vitest';
import { analyzeDocumentText, createSummaryPdf } from './logic';
import { PDFDocument } from 'pdf-lib';

describe('AI Document Chat & Summarizer Tool', () => {
  const samplePages = [
    {
      pageNumber: 1,
      text: 'Introduction to Artificial Intelligence. Machine learning systems analyze large datasets to uncover hidden patterns. Recent innovations show a 45% increase in computational performance across neural network architectures.',
    },
    {
      pageNumber: 2,
      text: 'Methodology and Evaluation. We tested the pipeline on benchmark benchmarks across multiple domains. The final accuracy reached 98%, demonstrating robust resilience under edge computing conditions. Engineers must ensure regular model recalibration.',
    },
  ];

  it('correctly calculates metrics and generates executive briefing structures', () => {
    const analysis = analyzeDocumentText(samplePages);
    expect(analysis.pageCount).toBe(2);
    expect(analysis.wordCount).toBeGreaterThan(20);
    expect(analysis.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(analysis.executiveThesis.length).toBeGreaterThan(15);
    expect(analysis.strategicHighlights.length).toBeGreaterThan(0);
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  });

  it('extracts cited findings, quantitative metrics, and action items for bullets mode', () => {
    const analysis = analyzeDocumentText(samplePages);
    expect(analysis.citedFindings.length).toBeGreaterThan(0);
    expect(analysis.citedFindings[0].page).toBeDefined();

    // Verify quantitative metrics extraction (45% or 98%)
    expect(analysis.quantitativeMetrics.length).toBeGreaterThan(0);
    expect(analysis.quantitativeMetrics.some((m) => m.metric.includes('%'))).toBe(true);

    // Verify action items detection (must ensure...)
    expect(analysis.actionItems.length).toBeGreaterThan(0);
    expect(analysis.actionItems[0].action).toContain('must ensure');
  });

  it('generates page-by-page section breakdown for comprehensive mode', () => {
    const analysis = analyzeDocumentText(samplePages);
    expect(analysis.pageBreakdown.length).toBe(2);
    expect(analysis.pageBreakdown[0].pageNumber).toBe(1);
    expect(analysis.pageBreakdown[1].pageNumber).toBe(2);
    expect(analysis.comprehensiveDigest.length).toBeGreaterThan(20);
  });

  it('accurately answers questions with relevant sentence and page citation', () => {
    const analysis = analyzeDocumentText(samplePages, 'accuracy reached');
    expect(analysis.answeredQuestion).toBeDefined();
    expect(analysis.answeredQuestion?.answer).toContain('98%');
    expect(analysis.answeredQuestion?.pageReference).toBe(2);
    expect(analysis.answeredQuestion?.confidence).toBe('High Relevance');
  });

  it('generates distinct valid PDF reports for all three modes', async () => {
    const analysis = analyzeDocumentText(samplePages);

    const execBytes = await createSummaryPdf('sample.pdf', analysis, 'executive');
    const bulletsBytes = await createSummaryPdf('sample.pdf', analysis, 'bullets');
    const compBytes = await createSummaryPdf('sample.pdf', analysis, 'comprehensive');

    expect(execBytes.byteLength).toBeGreaterThan(0);
    expect(bulletsBytes.byteLength).toBeGreaterThan(0);
    expect(compBytes.byteLength).toBeGreaterThan(0);

    const loadedExec = await PDFDocument.load(execBytes);
    expect(loadedExec.getPageCount()).toBeGreaterThanOrEqual(1);

    const loadedBullets = await PDFDocument.load(bulletsBytes);
    expect(loadedBullets.getPageCount()).toBeGreaterThanOrEqual(1);
  });
});
