import { ToolMetadata, ToolCategory } from './types';
import React from 'react';

// Phase 1 Client-side tools
import { mergeMetadata } from '../tools/merge/metadata';
import { executeMerge } from '../tools/merge/logic';
import { MergeComponent } from '../tools/merge/Component';

import { splitMetadata } from '../tools/split/metadata';
import { executeSplit } from '../tools/split/logic';
import { SplitComponent } from '../tools/split/Component';

import { removePagesMetadata } from '../tools/remove-pages/metadata';
import { executeRemovePages } from '../tools/remove-pages/logic';
import { RemovePagesComponent } from '../tools/remove-pages/Component';

import { extractPagesMetadata } from '../tools/extract-pages/metadata';
import { executeExtractPages } from '../tools/extract-pages/logic';
import { ExtractPagesComponent } from '../tools/extract-pages/Component';

import { organizeMetadata } from '../tools/organize/metadata';
import { executeOrganize } from '../tools/organize/logic';
import { OrganizeComponent } from '../tools/organize/Component';

import { rotateMetadata } from '../tools/rotate/metadata';
import { executeRotate } from '../tools/rotate/logic';
import { RotateComponent } from '../tools/rotate/Component';

import { pageNumbersMetadata } from '../tools/page-numbers/metadata';
import { executePageNumbers } from '../tools/page-numbers/logic';
import { PageNumbersComponent } from '../tools/page-numbers/Component';

import { watermarkMetadata } from '../tools/watermark/metadata';
import { executeWatermark } from '../tools/watermark/logic';
import { WatermarkComponent } from '../tools/watermark/Component';

import { jpgToPdfMetadata } from '../tools/jpg-to-pdf/metadata';
import { executeJpgToPdf } from '../tools/jpg-to-pdf/logic';
import { JpgToPdfComponent } from '../tools/jpg-to-pdf/Component';

import { pdfToJpgMetadata } from '../tools/pdf-to-jpg/metadata';
import { executePdfToJpg } from '../tools/pdf-to-jpg/logic';
import { PdfToJpgComponent } from '../tools/pdf-to-jpg/Component';

// Phase 2 Tools
import { compressMetadata } from '../tools/compress/metadata';
import { executeCompress } from '../tools/compress/logic';
import { CompressComponent } from '../tools/compress/Component';

import { signMetadata } from '../tools/sign/metadata';
import { executeSign } from '../tools/sign/logic';
import { SignComponent } from '../tools/sign/Component';

import { protectMetadata } from '../tools/protect/metadata';
import { executeProtect } from '../tools/protect/logic';
import { ProtectComponent } from '../tools/protect/Component';

import { unlockMetadata } from '../tools/unlock/metadata';
import { executeUnlock } from '../tools/unlock/logic';
import { UnlockComponent } from '../tools/unlock/Component';

import { repairMetadata } from '../tools/repair/metadata';
import { executeRepair } from '../tools/repair/logic';
import { RepairComponent } from '../tools/repair/Component';

import { aiSummaryMetadata } from '../tools/ai-summary/metadata';
import { executeAiSummary } from '../tools/ai-summary/logic';
import { AiSummaryComponent } from '../tools/ai-summary/Component';

export interface ActiveToolDefinition {
  metadata: ToolMetadata;
  execute: (...args: any[]) => Promise<any>;
  Component?: React.ComponentType<any>;
  defaultOptions?: any;
}

// Active client and hybrid tools (Phase 1 + Phase 2)
export const ACTIVE_TOOLS: Record<string, ActiveToolDefinition> = {
  'merge-pdf': {
    metadata: mergeMetadata,
    execute: executeMerge,
    Component: MergeComponent,
    defaultOptions: { outputFileName: '' },
  },
  'split-pdf': {
    metadata: splitMetadata,
    execute: executeSplit,
    Component: SplitComponent,
    defaultOptions: { mode: 'range', rangeString: '' },
  },
  'remove-pages': {
    metadata: removePagesMetadata,
    execute: executeRemovePages,
    Component: RemovePagesComponent,
    defaultOptions: { pagesToRemove: [], rangeString: '' },
  },
  'extract-pages': {
    metadata: extractPagesMetadata,
    execute: executeExtractPages,
    Component: ExtractPagesComponent,
    defaultOptions: { extractMode: 'single-pdf', rangeString: '' },
  },
  'organize-pdf': {
    metadata: organizeMetadata,
    execute: executeOrganize,
    Component: OrganizeComponent,
    defaultOptions: { pages: [] },
  },
  'rotate-pdf': {
    metadata: rotateMetadata,
    execute: executeRotate,
    Component: RotateComponent,
    defaultOptions: { angle: 90, scope: 'all' },
  },
  'page-numbers': {
    metadata: pageNumbersMetadata,
    execute: executePageNumbers,
    Component: PageNumbersComponent,
    defaultOptions: {
      format: 'page_n_of_total',
      position: 'bottom-center',
      fontSize: 10,
      margin: 24,
      startFrom: 1,
    },
  },
  'watermark': {
    metadata: watermarkMetadata,
    execute: executeWatermark,
    Component: WatermarkComponent,
    defaultOptions: {
      text: 'CONFIDENTIAL',
      fontSize: 48,
      opacity: 0.35,
      rotation: 45,
      color: 'gray',
      position: 'center',
    },
  },
  'jpg-to-pdf': {
    metadata: jpgToPdfMetadata,
    execute: executeJpgToPdf,
    Component: JpgToPdfComponent,
    defaultOptions: {
      pageOrientation: 'auto',
      pageSize: 'a4',
      margin: 'small',
    },
  },
  'pdf-to-jpg': {
    metadata: pdfToJpgMetadata,
    execute: executePdfToJpg,
    Component: PdfToJpgComponent,
    defaultOptions: {
      imageFormat: 'jpeg',
      quality: 'normal',
    },
  },
  'compress-pdf': {
    metadata: compressMetadata,
    execute: executeCompress,
    Component: CompressComponent,
    defaultOptions: { level: 'recommended' },
  },
  'sign-pdf': {
    metadata: signMetadata,
    execute: executeSign,
    Component: SignComponent,
    defaultOptions: {
      position: 'bottom-right',
      pageNumber: 1,
      signatureWidth: 160,
      signatureHeight: 60,
    },
  },
  'protect-pdf': {
    metadata: protectMetadata,
    execute: executeProtect,
    Component: ProtectComponent,
    defaultOptions: { password: '', confirmPassword: '' },
  },
  'unlock-pdf': {
    metadata: unlockMetadata,
    execute: executeUnlock,
    Component: UnlockComponent,
    defaultOptions: { password: '' },
  },
  'repair-pdf': {
    metadata: repairMetadata,
    execute: executeRepair,
    Component: RepairComponent,
    defaultOptions: { mode: 'standard' },
  },
  'ai-summary': {
    metadata: aiSummaryMetadata,
    execute: executeAiSummary,
    Component: AiSummaryComponent,
    defaultOptions: { mode: 'executive', userQuestion: '' },
  },
};

// Complete catalog including future roadmap tools across all 7 categories
export const ALL_TOOLS_METADATA: ToolMetadata[] = [
  // Organize PDF
  mergeMetadata,
  splitMetadata,
  removePagesMetadata,
  extractPagesMetadata,
  organizeMetadata,
  // Edit PDF
  rotateMetadata,
  pageNumbersMetadata,
  watermarkMetadata,
  signMetadata,
  // Convert to PDF
  jpgToPdfMetadata,
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'Convert to PDF',
    description: 'Convert Microsoft Word DOC and DOCX documents to standard PDF format.',
    iconName: 'FileText',
    mode: 'server',
    badge: 'Fast',
    acceptedTypes: ['.doc', '.docx', 'application/msword'],
    allowMultiple: false,
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'Convert to PDF',
    description: 'Turn Microsoft Excel spreadsheets (XLS, XLSX) into easy-to-read PDFs.',
    iconName: 'Sheet',
    mode: 'server',
    acceptedTypes: ['.xls', '.xlsx'],
    allowMultiple: false,
  },
  // Convert from PDF
  pdfToJpgMetadata,
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'Convert from PDF',
    description: 'Convert PDF documents into editable DOC and DOCX Word documents.',
    iconName: 'FileText',
    mode: 'server',
    badge: 'Popular',
    acceptedTypes: ['application/pdf'],
    allowMultiple: false,
    popular: true,
  },
  // Optimize PDF
  compressMetadata,
  repairMetadata,
  // PDF Security
  protectMetadata,
  unlockMetadata,
  // PDF Intelligence
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    category: 'PDF Intelligence',
    description: 'Extract text from scanned PDF documents with optical character recognition.',
    iconName: 'Eye',
    mode: 'server',
    badge: 'New',
    acceptedTypes: ['application/pdf'],
    allowMultiple: false,
  },
  aiSummaryMetadata,
];

export function getToolMetadata(id: string): ToolMetadata | undefined {
  return ALL_TOOLS_METADATA.find((t) => t.id === id);
}

export function getActiveTool(id: string): ActiveToolDefinition | undefined {
  return ACTIVE_TOOLS[id];
}

export function getToolsByCategory(category: ToolCategory): ToolMetadata[] {
  return ALL_TOOLS_METADATA.filter((t) => t.category === category);
}

export function searchTools(query: string): ToolMetadata[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_TOOLS_METADATA;
  return ALL_TOOLS_METADATA.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
}
