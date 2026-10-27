import { ToolMetadata } from '../../registry/types';

export const extractPagesMetadata: ToolMetadata = {
  id: 'extract-pages',
  name: 'Extract Pages',
  category: 'Organize PDF',
  description: 'Extract specific pages from your PDF file and save them as a new PDF or individual files.',
  iconName: 'FileOutput',
  mode: 'client',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
