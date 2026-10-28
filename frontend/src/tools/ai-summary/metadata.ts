import { ToolMetadata } from '../../registry/types';

export const aiSummaryMetadata: ToolMetadata = {
  id: 'ai-summary',
  name: 'AI Document Chat',
  category: 'PDF Intelligence',
  description: 'Summarize key points, ask questions, and chat with your documents with intelligent insights.',
  iconName: 'Sparkles',
  mode: 'client',
  badge: 'New',
  acceptedTypes: ['application/pdf'],
  allowMultiple: false,
  minFiles: 1,
  maxFiles: 1,
  popular: true,
};
