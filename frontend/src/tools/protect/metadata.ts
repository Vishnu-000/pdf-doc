import { ToolMetadata } from '../../registry/types';

export const protectMetadata: ToolMetadata = {
  id: 'protect-pdf',
  name: 'Protect PDF',
  category: 'PDF Security',
  description: 'Encrypt your PDF document with a secure password to prevent unauthorized access.',
  iconName: 'Lock',
  mode: 'server',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
