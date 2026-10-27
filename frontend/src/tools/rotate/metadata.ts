import { ToolMetadata } from '../../registry/types';

export const rotateMetadata: ToolMetadata = {
  id: 'rotate-pdf',
  name: 'Rotate PDF',
  category: 'Edit PDF',
  description: 'Rotate your PDF pages to landscape or portrait orientation permanently.',
  iconName: 'RotateCw',
  mode: 'client',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
