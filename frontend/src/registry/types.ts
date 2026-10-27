import React from 'react';

export type ToolCategory =
  | 'Organize PDF'
  | 'Optimize PDF'
  | 'Convert to PDF'
  | 'Convert from PDF'
  | 'Edit PDF'
  | 'PDF Security'
  | 'PDF Intelligence';

export type ToolMode = 'client' | 'server';

export interface ToolMetadata {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  iconName: string; // Key mapping to Lucide icon
  mode: ToolMode;
  badge?: 'Popular' | 'New' | 'Client-Side' | 'Fast';
  acceptedTypes: string[]; // e.g., ['application/pdf'] or ['image/jpeg', 'image/png']
  allowMultiple: boolean;
  minFiles?: number;
  maxFiles?: number;
  popular?: boolean;
}

export interface ToolExecutionProgress {
  percentage: number;
  message: string;
}

export interface ToolExecutionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  previewUrl?: string;
  stats?: {
    originalSize?: number;
    outputSize?: number;
    pageCount?: number;
    fileCount?: number;
  };
}

export interface ToolShellProps {
  metadata: ToolMetadata;
  execute: (
    files: File[],
    options: any,
    onProgress: (p: ToolExecutionProgress) => void
  ) => Promise<ToolExecutionResult>;
  renderOptions?: (props: {
    files: File[];
    options: any;
    setOptions: React.Dispatch<React.SetStateAction<any>>;
    disabled?: boolean;
  }) => React.ReactNode;
  initialOptions?: any;
}
