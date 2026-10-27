import { ToolMetadata } from '../../registry/types';

export const compressMetadata: ToolMetadata = {
  id: 'compress-pdf',
  name: 'Compress PDF',
  category: 'Optimize PDF',
  description: 'Reduce PDF file size while maintaining optimal visual quality with customizable compression presets.',
  iconName: 'Zap',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
