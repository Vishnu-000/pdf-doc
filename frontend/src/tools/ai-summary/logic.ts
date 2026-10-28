import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { extractPdfText } from '../../lib/pdf-renderer';

export type SummaryMode = 'executive' | 'bullets' | 'comprehensive';

export interface AiSummaryOptions {
  mode: SummaryMode;
  userQuestion?: string;
}

export interface DocumentAnalysis {
  wordCount: number;
  charCount: number;
  pageCount: number;
  readingTimeMinutes: number;
  executiveSummary: string;
  keyTakeaways: string[];
  answeredQuestion?: {
    question: string;
    answer: string;
    pageReference?: number;
  };
}

/**
 * Split text into individual sentences
 */
export function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 350);
}

/**
 * Compute key takeaways and executive summary using statistical frequency and sentence centrality
 */
export function analyzeDocumentText(
  pages: { pageNumber: number; text: string }[],
  question?: string
): DocumentAnalysis {
  const fullText = pages.map((p) => p.text).join(' ');
  const words = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const charCount = fullText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // If document has minimal or no text (e.g. scanned image only)
  if (wordCount < 10) {
    return {
      wordCount,
      charCount,
      pageCount: pages.length,
      readingTimeMinutes: 1,
      executiveSummary: 'This document contains mostly scanned images or non-extractable graphical content.',
      keyTakeaways: [
        'Document text extraction yielded limited selectable text.',
        'Use OCR PDF tool if this document consists of scanned paper pages.',
      ],
    };
  }

  // Tokenize and calculate word frequencies (ignoring common stopwords)
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'was',
    'were', 'will', 'been', 'which', 'their', 'they', 'what', 'when', 'where',
    'more', 'about', 'some', 'also', 'into', 'than', 'them', 'other', 'then',
  ]);

  const wordFrequencies: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length > 3 && !stopWords.has(clean)) {
      wordFrequencies[clean] = (wordFrequencies[clean] || 0) + 1;
    }
  }

  // Score sentences across all pages
  const allSentencesWithPages: { sentence: string; page: number; score: number }[] = [];

  pages.forEach((p) => {
    const sentences = extractSentences(p.text);
    sentences.forEach((sentence, idx) => {
      const sentenceWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      let score = 0;
      for (const sw of sentenceWords) {
        score += wordFrequencies[sw] || 0;
      }

      // Boost sentences near top of page (often topic sentences)
      if (idx === 0) score *= 1.35;
      // Boost sentences with numbers/statistics
      if (/\d+/.test(sentence)) score *= 1.2;

      allSentencesWithPages.push({
        sentence,
        page: p.pageNumber,
        score: score / Math.max(1, sentenceWords.length),
      });
    });
  });

  // Sort by highest informational density
  const ranked = [...allSentencesWithPages].sort((a, b) => b.score - a.score);

  // Pick top sentences for executive summary and bullet points
  const topTakeaways = ranked.slice(0, 5).map((item) => `${item.sentence} [Page ${item.page}]`);
  const executiveSummary = ranked.length > 0
    ? ranked.slice(0, 3).map((r) => r.sentence).join(' ')
    : 'Document processed successfully.';

  // If user provided a question, search for best answering passage
  let answeredQuestion: DocumentAnalysis['answeredQuestion'];
  if (question && question.trim().length > 0) {
    const qTokens = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((t) => t.length > 2);
    let bestMatch = { sentence: '', page: 1, score: 0 };

    allSentencesWithPages.forEach((item) => {
      const lower = item.sentence.toLowerCase();
      let matchCount = 0;
      for (const qt of qTokens) {
        if (lower.includes(qt)) matchCount += 1;
      }
      if (matchCount > bestMatch.score) {
        bestMatch = { sentence: item.sentence, page: item.page, score: matchCount };
      }
    });

    if (bestMatch.score > 0) {
      answeredQuestion = {
        question: question.trim(),
        answer: bestMatch.sentence,
        pageReference: bestMatch.page,
      };
    } else {
      answeredQuestion = {
        question: question.trim(),
        answer: 'No directly matching sentence was found for this specific query in the document.',
      };
    }
  }

  return {
    wordCount,
    charCount,
    pageCount: pages.length,
    readingTimeMinutes,
    executiveSummary,
    keyTakeaways: topTakeaways,
    answeredQuestion,
  };
}

/**
 * Generate a beautifully formatted PDF report of the analysis
 */
export async function createSummaryPdf(
  fileName: string,
  analysis: DocumentAnalysis,
  mode: SummaryMode = 'executive'
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.85, 0.22, 0.21); // Brand red
  const slateDark = rgb(0.09, 0.11, 0.15);
  const slateMuted = rgb(0.39, 0.45, 0.55);

  let y = 780;

  // Header Title
  page.drawText('PDF-Doc — Document Intelligence Report', {
    x: 48,
    y,
    size: 18,
    font: boldFont,
    color: primaryColor,
  });
  y -= 22;

  page.drawText(`Document: ${fileName} | Mode: ${mode.toUpperCase()}`, {
    x: 48,
    y,
    size: 10,
    font,
    color: slateMuted,
  });
  y -= 32;

  // Document Overview Metrics Box
  page.drawRectangle({
    x: 48,
    y: y - 48,
    width: 499,
    height: 54,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.88, 0.91, 0.94),
    borderWidth: 1,
  });

  const metricsText = `Pages: ${analysis.pageCount}   |   Words: ${analysis.wordCount.toLocaleString()}   |   Characters: ${analysis.charCount.toLocaleString()}   |   Est. Reading Time: ~${analysis.readingTimeMinutes} min`;
  page.drawText(metricsText, {
    x: 64,
    y: y - 28,
    size: 10,
    font: boldFont,
    color: slateDark,
  });
  y -= 75;

  // Executive Summary Section
  page.drawText('EXECUTIVE SUMMARY', {
    x: 48,
    y,
    size: 12,
    font: boldFont,
    color: slateDark,
  });
  y -= 16;

  // Wrap executive summary text
  const words = analysis.executiveSummary.split(' ');
  let currentLine = '';
  for (const w of words) {
    const testLine = currentLine ? `${currentLine} ${w}` : w;
    if (testLine.length > 85) {
      page.drawText(currentLine, { x: 48, y, size: 9.5, font, color: slateDark });
      y -= 14;
      currentLine = w;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, { x: 48, y, size: 9.5, font, color: slateDark });
    y -= 26;
  }

  // Key Takeaways Section
  page.drawText('KEY FINDINGS & TAKEAWAYS', {
    x: 48,
    y,
    size: 12,
    font: boldFont,
    color: slateDark,
  });
  y -= 18;

  for (const bullet of analysis.keyTakeaways) {
    const bulletWords = bullet.split(' ');
    let bLine = '• ';
    for (const bw of bulletWords) {
      if ((bLine + bw).length > 80) {
        page.drawText(bLine, { x: 54, y, size: 9, font, color: slateDark });
        y -= 13;
        bLine = '  ' + bw + ' ';
      } else {
        bLine += bw + ' ';
      }
    }
    if (bLine.trim()) {
      page.drawText(bLine, { x: 54, y, size: 9, font, color: slateDark });
      y -= 18;
    }
  }

  // If question was asked and answered
  if (analysis.answeredQuestion) {
    y -= 10;
    page.drawText(`QUERY: "${analysis.answeredQuestion.question}"`, {
      x: 48,
      y,
      size: 10,
      font: boldFont,
      color: primaryColor,
    });
    y -= 15;

    page.drawText(`Answer: ${analysis.answeredQuestion.answer}`, {
      x: 48,
      y,
      size: 9,
      font,
      color: slateDark,
    });
  }

  return await doc.save();
}

/**
 * Execution handler for ToolShell
 */
export async function executeAiSummary(
  files: File[],
  options: AiSummaryOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to analyze');
  }

  const file = files[0];
  onProgress({ percentage: 15, message: 'Extracting text and structure...' });

  const buffer = await readFileAsArrayBuffer(file);
  const pages = await extractPdfText(buffer, (cur, tot) => {
    onProgress({
      percentage: 15 + Math.round((cur / tot) * 45),
      message: `Analyzing page ${cur} of ${tot}...`,
    });
  });

  onProgress({ percentage: 70, message: 'Generating key takeaways and insights...' });
  const analysis = analyzeDocumentText(pages, options.userQuestion);

  onProgress({ percentage: 85, message: 'Formatting intelligence summary document...' });
  const summaryPdfBytes = await createSummaryPdf(file.name, analysis, options.mode || 'executive');

  const blob = new Blob([summaryPdfBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Intelligence analysis complete!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_AI_Summary.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
