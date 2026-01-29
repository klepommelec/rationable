import type { Meta, StoryObj } from '@storybook/react';
import { HistoryItem } from './HistoryItem';
import { IDecision } from '@/types/decision';

// Mock data
const mockDecision: IDecision = {
  id: 'decision-1',
  dilemma: 'Which laptop should I buy for software development?',
  result: {
    recommendation: 'MacBook Pro',
    description: 'Based on your needs...',
    breakdown: [
      {
        option: 'MacBook Pro',
        description: 'High-performance laptop.',
        pros: ['Powerful', 'Great display'],
        cons: ['Expensive'],
        score: 92,
      },
    ],
  },
  emoji: '💻',
  created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  updated_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
};

const meta = {
  title: 'History/HistoryItem',
  component: HistoryItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    decision: mockDecision,
    onLoad: (id) => console.log('Load decision:', id),
    onDelete: (id) => console.log('Delete decision:', id),
  },
};

export const Loading: Story = {
  args: {
    decision: mockDecision,
    loadId: 'decision-1',
    onLoad: (id) => console.log('Load decision:', id),
    onDelete: (id) => console.log('Delete decision:', id),
  },
};

export const WithFollowUps: Story = {
  args: {
    decision: mockDecision,
    followUpCount: 3,
    onLoad: (id) => console.log('Load decision:', id),
    onDelete: (id) => console.log('Delete decision:', id),
  },
};

export const WithTitleOverride: Story = {
  args: {
    decision: mockDecision,
    titleOverride: 'Custom Title',
    onLoad: (id) => console.log('Load decision:', id),
    onDelete: (id) => console.log('Delete decision:', id),
  },
};
