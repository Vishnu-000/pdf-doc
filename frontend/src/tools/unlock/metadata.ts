import { ToolMetadata } from '../../registry/types';

export const unlockMetadata: ToolMetadata = {
  id: 'unlock-pdf',
  name: 'Unlock PDF',
  category: 'PDF Security',
  description: 'Remove password restrictions and security permissions from your encrypted PDF.',
  iconName: 'Unlock',
  mode: 'server',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
