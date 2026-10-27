import { ToolMetadata } from '../../registry/types';

export const watermarkMetadata: ToolMetadata = {
  id: 'watermark',
  name: 'Add Watermark',
  category: 'Edit PDF',
  description: 'Stamp an image or text watermark over your PDF document with customizable opacity and position.',
  iconName: 'Stamp',
  mode: 'client',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
};
