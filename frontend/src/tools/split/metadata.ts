import { ToolMetadata } from '../../registry/types';

export const splitMetadata: ToolMetadata = {
  id: 'split-pdf',
  name: 'Split PDF',
  category: 'Organize PDF',
  description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
  iconName: 'Split',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
