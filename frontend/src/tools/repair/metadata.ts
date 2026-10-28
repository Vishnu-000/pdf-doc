import { ToolMetadata } from '../../registry/types';

export const repairMetadata: ToolMetadata = {
  id: 'repair-pdf',
  name: 'Repair PDF',
  category: 'Optimize PDF',
  description: 'Analyze and repair corrupted, damaged, or unreadable PDF files and rebuild damaged xref tables.',
  iconName: 'Wrench',
  mode: 'client',
  badge: 'New',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
