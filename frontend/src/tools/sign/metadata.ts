import { ToolMetadata } from '../../registry/types';

export const signMetadata: ToolMetadata = {
  id: 'sign-pdf',
  name: 'Sign PDF',
  category: 'Edit PDF',
  description: 'Create your signature by drawing, typing, or uploading, and place it directly on your document.',
  iconName: 'PenTool',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
