import { ToolMetadata } from '../../registry/types';

export const mergeMetadata: ToolMetadata = {
  id: 'merge-pdf',
  name: 'Merge PDF',
  category: 'Organize PDF',
  description: 'Combine multiple PDF files into a single unified document in any order you choose.',
  iconName: 'Layers',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: true,
  minFiles: 2,
  popular: true,
};
