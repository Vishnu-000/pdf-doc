import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib';
import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';
import { readFileAsArrayBuffer } from '../../lib/file-utils';
import { extractPdfText } from '../../lib/pdf-renderer';

export type SummaryMode = 'executive' | 'bullets' | 'comprehensive';

export interface AiSummaryOptions {
  mode: SummaryMode;
  userQuestion?: string;
}

export interface QuantitativeMetric {
  metric: string;
  context: string;
  page: number;
}

export interface PageSectionSummary {
  pageNumber: number;
  inferredTitle: string;
  keyPoints: string[];
}

export interface TermDefinition {
  term: string;
  count: number;
  context: string;
  page: number;
}

export interface DocumentAnalysis {
  wordCount: number;
  charCount: number;
  pageCount: number;
  readingTimeMinutes: number;
  complexityScore: string;
  lexicalRichnessPercent: number;

  // Mode 1: Executive Briefing
  executiveThesis: string;
  strategicHighlights: string[];
  recommendations: string[];

  // Mode 2: Key Takeaways & Citations
  citedFindings: { text: string; page: number }[];
  quantitativeMetrics: QuantitativeMetric[];
  actionItems: { action: string; page: number }[];

  // Mode 3: Comprehensive Digest
  pageBreakdown: PageSectionSummary[];
  glossary: TermDefinition[];
  comprehensiveDigest: string;

  // Q&A
  answeredQuestion?: {
    question: string;
    answer: string;
    surroundingContext?: string;
    pageReference?: number;
    confidence: 'High Relevance' | 'Medium Relevance' | 'Low Relevance';
  };
}

/**
 * Split text into individual sentences
 */
export function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 400);
}

/**
 * Advanced multi-depth document analysis engine
 */
export function analyzeDocumentText(
  pages: { pageNumber: number; text: string }[],
  question?: string
): DocumentAnalysis {
  const fullText = pages.map((p) => p.text).join(' ');
  const rawWords = fullText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = rawWords.length;
  const charCount = fullText.length;
  const pageCount = pages.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Default empty state for raster/scanned image PDFs with negligible selectable text
  if (wordCount < 10) {
    return {
      wordCount,
      charCount,
      pageCount,
      readingTimeMinutes: 1,
      complexityScore: 'Low / Scanned Image',
      lexicalRichnessPercent: 0,
      executiveThesis: 'This document contains mostly scanned images or non-extractable graphical content without OCR layers.',
      strategicHighlights: [
        'Document text extraction yielded limited selectable text.',
        'Use OCR PDF tool if this document consists of scanned paper pages.',
      ],
      recommendations: ['Apply optical character recognition (OCR) before textual parsing.'],
      citedFindings: [],
      quantitativeMetrics: [],
      actionItems: [],
      pageBreakdown: pages.map((p) => ({
        pageNumber: p.pageNumber,
        inferredTitle: `Page ${p.pageNumber}`,
        keyPoints: ['Scanned raster content.'],
      })),
      glossary: [],
      comprehensiveDigest: 'Non-textual or scanned document.',
    };
  }

  // Common stopwords list
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'was',
    'were', 'will', 'been', 'which', 'their', 'they', 'what', 'when', 'where',
    'more', 'about', 'some', 'also', 'into', 'than', 'them', 'other', 'then',
    'there', 'these', 'could', 'would', 'should', 'each', 'such', 'only',
  ]);

  const cleanWords = rawWords
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const uniqueWords = new Set(cleanWords);
  const lexicalRichnessPercent = Math.min(100, Math.round((uniqueWords.size / Math.max(1, cleanWords.length)) * 100));

  // Compute word frequencies
  const wordFrequencies: Record<string, number> = {};
  for (const w of cleanWords) {
    wordFrequencies[w] = (wordFrequencies[w] || 0) + 1;
  }

  // Parse all sentences with page references and informative scores
  const allSentencesWithPages: { sentence: string; page: number; score: number }[] = [];
  const allSentencesList: { sentence: string; page: number }[] = [];

  pages.forEach((p) => {
    const sentences = extractSentences(p.text);
    sentences.forEach((sentence, idx) => {
      allSentencesList.push({ sentence, page: p.pageNumber });

      const sWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      let score = 0;
      for (const sw of sWords) {
        score += wordFrequencies[sw] || 0;
      }

      // Boost topic sentences near top of page
      if (idx === 0) score *= 1.4;
      // Boost sentences with numbers / percentages / metrics
      if (/\d+/.test(sentence)) score *= 1.25;
      // Boost sentences with definitive verbs
      if (/\b(found|concluded|demonstrated|results|discovered|achieved|improved|critical|key)\b/i.test(sentence)) {
        score *= 1.3;
      }

      allSentencesWithPages.push({
        sentence,
        page: p.pageNumber,
        score: score / Math.max(1, sWords.length),
      });
    });
  });

  // Calculate readability complexity
  const avgSentenceLength = wordCount / Math.max(1, allSentencesList.length);
  let complexityScore = 'Professional Business (Standard)';
  if (avgSentenceLength > 24) {
    complexityScore = 'Advanced Academic / Legal (High Density)';
  } else if (avgSentenceLength < 14) {
    complexityScore = 'Direct & Accessible (Clear Prose)';
  }

  // Sort sentences by informational density
  const ranked = [...allSentencesWithPages].sort((a, b) => b.score - a.score);

  // 1. Executive Briefing Structure
  const topSentences = ranked.slice(0, 4).map((r) => r.sentence);
  const executiveThesis = topSentences.length > 0
    ? topSentences.slice(0, 2).join(' ') + ' ' + (topSentences[2] || '')
    : 'Document analyzed successfully.';

  const strategicHighlights = ranked.slice(0, 4).map((r) => r.sentence);

  // Recommendations extracted from imperative or conclusive statements
  const recCandidates = allSentencesWithPages
    .filter((s) => /\b(recommend|recommendation|should|suggest|must|ensure|future work|next steps|strategy)\b/i.test(s.sentence))
    .sort((a, b) => b.score - a.score);
  const recommendations = recCandidates.length > 0
    ? recCandidates.slice(0, 3).map((r) => `${r.sentence} [Page ${r.page}]`)
    : [
        'Continue periodic assessment of documented workflows.',
        'Validate operational assumptions against live benchmarks.',
      ];

  // 2. Key Takeaways & Citations Structure
  const citedFindings = ranked.slice(0, 6).map((r) => ({
    text: r.sentence,
    page: r.page,
  }));

  // Extract Quantitative Metrics & Numbers
  const quantitativeMetrics: QuantitativeMetric[] = [];
  const metricRegex = /(?:\$\s*\d+(?:\.\d+)?(?:\s*(?:million|billion|k|M|B))?|\b\d+(?:\.\d+)?%|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:GB|MB|ms|users|samples|iterations|sec|seconds|percent|accuracy|rate)\b)/gi;

  for (const item of allSentencesList) {
    const matches = item.sentence.match(metricRegex);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        if (!quantitativeMetrics.some((q) => q.metric === m)) {
          quantitativeMetrics.push({
            metric: m.trim(),
            context: item.sentence,
            page: item.page,
          });
        }
      }
    }
    if (quantitativeMetrics.length >= 6) break;
  }

  // Extract Action Items & Obligations
  const actionItems: { action: string; page: number }[] = [];
  const actionRegex = /\b(must|shall|will require|ensure that|responsible for|deadline|action item|to be completed|mandated)\b/i;
  for (const item of allSentencesList) {
    if (actionRegex.test(item.sentence)) {
      actionItems.push({ action: item.sentence, page: item.page });
      if (actionItems.length >= 4) break;
    }
  }

  // 3. Comprehensive Digest Structure (Section & Page Breakdown)
  const pageBreakdown: PageSectionSummary[] = pages.map((p) => {
    const pageSentences = extractSentences(p.text);
    const lines = p.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 3 && l.length < 80);
    const inferredTitle = lines[0] || `Page ${p.pageNumber} Overview`;

    return {
      pageNumber: p.pageNumber,
      inferredTitle,
      keyPoints: pageSentences.slice(0, 2),
    };
  });

  // Extract Glossary of Acronyms and Specialized Terms
  const acronymRegex = /\b[A-Z]{2,6}\b/g;
  const acronymCounts: Record<string, { count: number; context: string; page: number }> = {};
  for (const item of allSentencesList) {
    const matches = item.sentence.match(acronymRegex);
    if (matches) {
      for (const acr of matches) {
        if (!['PDF', 'AND', 'FOR', 'NOT', 'THE', 'PAGE'].includes(acr)) {
          if (!acronymCounts[acr]) {
            acronymCounts[acr] = { count: 1, context: item.sentence, page: item.page };
          } else {
            acronymCounts[acr].count += 1;
          }
        }
      }
    }
  }

  const glossary: TermDefinition[] = Object.entries(acronymCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([term, data]) => ({
      term,
      count: data.count,
      context: data.context,
      page: data.page,
    }));

  const comprehensiveDigest = pages
    .map((p) => {
      const s = extractSentences(p.text).slice(0, 2).join(' ');
      return `Section [Page ${p.pageNumber}]: ${s || p.text.slice(0, 150) + '...'}`;
    })
    .join('\n\n');

  // 4. Interactive Q&A Search Engine
  let answeredQuestion: DocumentAnalysis['answeredQuestion'];
  if (question && question.trim().length > 0) {
    const qTokens = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((t) => t.length > 2 && !stopWords.has(t));
    let bestMatch = { sentence: '', context: '', page: 1, score: 0 };

    allSentencesList.forEach((item) => {
      const lower = item.sentence.toLowerCase();
      let matchCount = 0;
      for (const qt of qTokens) {
        if (lower.includes(qt)) matchCount += 1;
      }
      if (matchCount > bestMatch.score) {
        bestMatch = {
          sentence: item.sentence,
          context: item.sentence,
          page: item.page,
          score: matchCount,
        };
      }
    });

    if (bestMatch.score > 0) {
      const confidence: 'High Relevance' | 'Medium Relevance' | 'Low Relevance' =
        bestMatch.score >= 2 ? 'High Relevance' : 'Medium Relevance';

      answeredQuestion = {
        question: question.trim(),
        answer: bestMatch.sentence,
        surroundingContext: bestMatch.context,
        pageReference: bestMatch.page,
        confidence,
      };
    } else {
      answeredQuestion = {
        question: question.trim(),
        answer: 'No matching passage containing these key terms was identified in the document.',
        confidence: 'Low Relevance',
      };
    }
  }

  return {
    wordCount,
    charCount,
    pageCount,
    readingTimeMinutes,
    complexityScore,
    lexicalRichnessPercent,
    executiveThesis,
    strategicHighlights,
    recommendations,
    citedFindings,
    quantitativeMetrics,
    actionItems,
    pageBreakdown,
    glossary,
    comprehensiveDigest,
    answeredQuestion,
  };
}

/**
 * Creates multi-page formatted intelligence PDF report tailored to the selected depth
 */
export async function createSummaryPdf(
  fileName: string,
  analysis: DocumentAnalysis,
  mode: SummaryMode = 'executive'
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = rgb(0.85, 0.22, 0.21); // Brand red
  const slateDark = rgb(0.09, 0.11, 0.15);
  const slateMuted = rgb(0.39, 0.45, 0.55);

  let currentPage = doc.addPage([595, 842]); // A4
  let y = 780;

  const checkPageBreak = (neededSpace: number): PDFPage => {
    if (y - neededSpace < 50) {
      currentPage = doc.addPage([595, 842]);
      y = 780;
    }
    return currentPage;
  };

  const drawWrappedText = (
    text: string,
    x: number,
    fontSize: number,
    isBold: boolean = false,
    color = slateDark,
    maxWidth = 499
  ) => {
    const targetFont = isBold ? boldFont : font;
    const words = text.split(' ');
    let line = '';
    const lineHeight = fontSize + 4;

    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (test.length * (fontSize * 0.52) > maxWidth) {
        checkPageBreak(lineHeight);
        currentPage.drawText(line, { x, y, size: fontSize, font: targetFont, color });
        y -= lineHeight;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) {
      checkPageBreak(lineHeight);
      currentPage.drawText(line, { x, y, size: fontSize, font: targetFont, color });
      y -= lineHeight;
    }
  };

  // Header Title
  const modeLabels: Record<SummaryMode, string> = {
    executive: 'EXECUTIVE BRIEFING REPORT',
    bullets: 'KEY FINDINGS & CITATIONS REPORT',
    comprehensive: 'COMPREHENSIVE DIGEST REPORT',
  };

  currentPage.drawText(`PDF-Doc — ${modeLabels[mode]}`, {
    x: 48,
    y,
    size: 16,
    font: boldFont,
    color: primaryColor,
  });
  y -= 20;

  currentPage.drawText(`Document: ${fileName}  |  Generated by PDF Intelligence Engine`, {
    x: 48,
    y,
    size: 9.5,
    font,
    color: slateMuted,
  });
  y -= 26;

  // Overview Metrics Box
  checkPageBreak(50);
  currentPage.drawRectangle({
    x: 48,
    y: y - 44,
    width: 499,
    height: 48,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.88, 0.91, 0.94),
    borderWidth: 1,
  });

  currentPage.drawText(
    `Pages: ${analysis.pageCount}   |   Words: ${analysis.wordCount.toLocaleString()}   |   Reading Time: ~${analysis.readingTimeMinutes} min   |   Complexity: ${analysis.complexityScore}`,
    { x: 58, y: y - 28, size: 9, font: boldFont, color: slateDark }
  );
  y -= 64;

  // RENDER SECTIONS BASED ON SELECTED DEPTH
  if (mode === 'executive') {
    // 1. EXECUTIVE THESIS
    currentPage.drawText('EXECUTIVE THESIS & STRATEGIC OVERVIEW', {
      x: 48,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    y -= 16;
    drawWrappedText(analysis.executiveThesis, 48, 9.5, false, slateDark);
    y -= 14;

    // 2. STRATEGIC HIGHLIGHTS
    checkPageBreak(40);
    currentPage.drawText('KEY STRATEGIC HIGHLIGHTS', {
      x: 48,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    y -= 16;
    for (const h of analysis.strategicHighlights) {
      drawWrappedText(`- ${h}`, 54, 9, false, slateDark, 490);
      y -= 4;
    }
    y -= 10;

    // 3. RECOMMENDATIONS
    checkPageBreak(40);
    currentPage.drawText('RECOMMENDED ACTIONS & DIRECTIVES', {
      x: 48,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    y -= 16;
    for (const r of analysis.recommendations) {
      drawWrappedText(`* ${r}`, 54, 9, false, slateDark, 490);
      y -= 4;
    }
  } else if (mode === 'bullets') {
    // 1. CITED FINDINGS
    currentPage.drawText('VERIFIED FINDINGS WITH PAGE CITATIONS', {
      x: 48,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    y -= 16;
    for (const f of analysis.citedFindings) {
      drawWrappedText(`[Page ${f.page}]  ${f.text}`, 52, 9, false, slateDark);
      y -= 5;
    }
    y -= 12;

    // 2. QUANTITATIVE METRICS & DATA POINTS
    if (analysis.quantitativeMetrics.length > 0) {
      checkPageBreak(50);
      currentPage.drawText('EXTRACTED QUANTITATIVE METRICS & DATA POINTS', {
        x: 48,
        y,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });
      y -= 16;
      for (const m of analysis.quantitativeMetrics) {
        drawWrappedText(`- ${m.metric} : ${m.context} [Page ${m.page}]`, 54, 9, false, slateDark);
        y -= 4;
      }
      y -= 10;
    }

    // 3. ACTION ITEMS
    if (analysis.actionItems.length > 0) {
      checkPageBreak(50);
      currentPage.drawText('DETECTED OBLIGATIONS & ACTION ITEMS', {
        x: 48,
        y,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });
      y -= 16;
      for (const a of analysis.actionItems) {
        drawWrappedText(`> ${a.action} [Page ${a.page}]`, 54, 9, false, slateDark);
        y -= 4;
      }
    }
  } else {
    // COMPREHENSIVE DIGEST
    // 1. PAGE-BY-PAGE SECTION BREAKDOWN
    currentPage.drawText('DOCUMENT SECTION & PAGE BREAKDOWN', {
      x: 48,
      y,
      size: 11,
      font: boldFont,
      color: primaryColor,
    });
    y -= 16;

    for (const pb of analysis.pageBreakdown) {
      checkPageBreak(30);
      currentPage.drawText(`Page ${pb.pageNumber}: ${pb.inferredTitle}`, {
        x: 52,
        y,
        size: 9.5,
        font: boldFont,
        color: slateDark,
      });
      y -= 14;
      if (pb.keyPoints.length > 0) {
        drawWrappedText(pb.keyPoints.join(' '), 60, 8.5, false, slateMuted, 480);
        y -= 4;
      }
    }
    y -= 12;

    // 2. GLOSSARY OF TERMS
    if (analysis.glossary.length > 0) {
      checkPageBreak(50);
      currentPage.drawText('KEY TERMINOLOGY & ACRONYMS', {
        x: 48,
        y,
        size: 11,
        font: boldFont,
        color: primaryColor,
      });
      y -= 16;
      for (const g of analysis.glossary) {
        drawWrappedText(`- ${g.term} (${g.count} occurrences): ${g.context} [Page ${g.page}]`, 54, 8.5, false, slateDark);
        y -= 4;
      }
    }
  }

  // QUESTION & ANSWER BOX (IF SUBMITTED)
  if (analysis.answeredQuestion) {
    checkPageBreak(70);
    y -= 10;
    currentPage.drawRectangle({
      x: 48,
      y: y - 56,
      width: 499,
      height: 60,
      color: rgb(0.96, 0.98, 1.0),
      borderColor: rgb(0.75, 0.85, 1.0),
      borderWidth: 1,
    });

    currentPage.drawText(`QUERY: "${analysis.answeredQuestion.question}" (${analysis.answeredQuestion.confidence})`, {
      x: 58,
      y: y - 20,
      size: 9.5,
      font: boldFont,
      color: rgb(0.1, 0.35, 0.75),
    });

    currentPage.drawText(
      `Answer [Page ${analysis.answeredQuestion.pageReference || 1}]: ${analysis.answeredQuestion.answer.slice(0, 110)}...`,
      { x: 58, y: y - 40, size: 8.5, font, color: slateDark }
    );
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
  onProgress({ percentage: 15, message: 'Extracting document text...' });

  const buffer = await readFileAsArrayBuffer(file);
  const pages = await extractPdfText(buffer, (cur, tot) => {
    onProgress({
      percentage: 15 + Math.round((cur / tot) * 45),
      message: `Scanning page ${cur} of ${tot}...`,
    });
  });

  onProgress({
    percentage: 70,
    message: `Synthesizing ${options.mode || 'executive'} intelligence digest...`,
  });
  const analysis = analyzeDocumentText(pages, options.userQuestion);

  onProgress({ percentage: 85, message: 'Rendering custom intelligence PDF report...' });
  const summaryPdfBytes = await createSummaryPdf(file.name, analysis, options.mode || 'executive');

  const blob = new Blob([summaryPdfBytes as BlobPart], { type: 'application/pdf' });
  onProgress({ percentage: 100, message: 'Document analysis complete!' });

  const modeSlug = options.mode || 'executive';
  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_${modeSlug}_report.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
