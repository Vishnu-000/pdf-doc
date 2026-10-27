import { ToolMetadata } from '../../registry/types';

export const removePagesMetadata: ToolMetadata = {
  id: 'remove-pages',
  name: 'Remove Pages',
  category: 'Organize PDF',
  description: 'Delete unwanted pages from your PDF document easily with visual page selection.',
  iconName: 'Trash2',
  mode: 'client',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
