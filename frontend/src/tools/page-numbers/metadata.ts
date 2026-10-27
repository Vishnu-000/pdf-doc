import { ToolMetadata } from '../../registry/types';

export const pageNumbersMetadata: ToolMetadata = {
  id: 'page-numbers',
  name: 'Page Numbers',
  category: 'Edit PDF',
  description: 'Add page numbers into PDF documents easily with customized typography, layout, and position.',
  iconName: 'Hash',
  mode: 'client',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
