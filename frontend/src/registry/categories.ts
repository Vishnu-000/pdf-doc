import { ToolCategory } from './types';

export interface CategoryMetadata {
  name: ToolCategory;
  slug: string;
  description: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
}

export const CATEGORIES: Record<ToolCategory, CategoryMetadata> = {
  'Organize PDF': {
    name: 'Organize PDF',
    slug: 'organize',
    description: 'Merge, split, remove, reorder, and extract pages from your documents.',
    iconName: 'Layers',
    colorClass: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  'Optimize PDF': {
    name: 'Optimize PDF',
    slug: 'optimize',
    description: 'Compress PDF size and repair damaged or corrupted documents.',
    iconName: 'Zap',
    colorClass: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'Convert to PDF': {
    name: 'Convert to PDF',
    slug: 'convert-to',
    description: 'Convert Word, PowerPoint, Excel, JPG, and HTML files into PDF.',
    iconName: 'ArrowDownToLine',
    colorClass: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'Convert from PDF': {
    name: 'Convert from PDF',
    slug: 'convert-from',
    description: 'Convert PDF files to JPG, Word, Excel, and PowerPoint documents.',
    iconName: 'ArrowUpFromLine',
    colorClass: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  'Edit PDF': {
    name: 'Edit PDF',
    slug: 'edit',
    description: 'Rotate, add page numbers, apply watermarks, or crop documents.',
    iconName: 'Edit3',
    colorClass: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  'PDF Security': {
    name: 'PDF Security',
    slug: 'security',
    description: 'Protect with passwords, unlock encrypted files, and sign PDFs.',
    iconName: 'ShieldCheck',
    colorClass: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  'PDF Intelligence': {
    name: 'PDF Intelligence',
    slug: 'intelligence',
    description: 'Extract text with OCR, summarize with AI, and chat with documents.',
    iconName: 'Sparkles',
    colorClass: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
