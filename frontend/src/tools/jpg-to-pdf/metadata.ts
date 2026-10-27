import { ToolMetadata } from '../../registry/types';

export const jpgToPdfMetadata: ToolMetadata = {
  id: 'jpg-to-pdf',
  name: 'JPG to PDF',
  category: 'Convert to PDF',
  description: 'Convert JPG, PNG, and WebP images to a beautifully formatted PDF file in seconds.',
  iconName: 'Image',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowMultiple: true,
  minFiles: 1,
  popular: true,
};
