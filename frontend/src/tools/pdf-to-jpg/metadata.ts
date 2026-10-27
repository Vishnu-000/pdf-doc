import { ToolMetadata } from '../../registry/types';

export const pdfToJpgMetadata: ToolMetadata = {
  id: 'pdf-to-jpg',
  name: 'PDF to JPG',
  category: 'Convert from PDF',
  description: 'Convert PDF pages into high-resolution JPG or PNG images instantly in your browser.',
  iconName: 'FileImage',
  mode: 'client',
  badge: 'Popular',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
