import { ToolMetadata } from '../../registry/types';

export const organizeMetadata: ToolMetadata = {
  id: 'organize-pdf',
  name: 'Organize PDF',
  category: 'Organize PDF',
  description: 'Sort, reorder, rotate, duplicate, or delete individual pages of your PDF document.',
  iconName: 'LayoutGrid',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
