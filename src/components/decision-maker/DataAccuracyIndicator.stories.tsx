import type { Meta, StoryObj } from '@storybook/react';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';
import { IResult } from '@/types/decision';

// Mock data
const mockResult: IResult = {
  id: 'result-1',
  recommendation: 'MacBook Pro',
  description: 'Based on your needs, the MacBook Pro offers the best combination.',
  breakdown: [
    {
      option: 'MacBook Pro',
      description: 'High-performance laptop.',
      pros: ['Powerful', 'Great display'],
      cons: ['Expensive'],
      score: 92,
    },
  ],
  realTimeData: {
    timestamp: Date.now(),
    sources: [
      'https://apple.com/macbook-pro',
      'https://techcrunch.com/laptops',
    ],
  },
  infoLinks: [
    { title: 'Apple MacBook Pro', url: 'https://apple.com/macbook-pro' },
  ],
};

const mockDecision = {
  id: 'decision-1',
  timestamp: Date.now() - 86400000, // 1 day ago
  createdByName: 'John Doe',
  updatedAt: Date.now() - 3600000, // 1 hour ago
  updatedByName: 'Jane Smith',
};

const meta = {
  title: 'DecisionMaker/DataAccuracyIndicator',
  component: DataAccuracyIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataAccuracyIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    result: mockResult,
    currentDecision: mockDecision,
  },
};

export const WithoutUpdates: Story = {
  args: {
    result: mockResult,
    currentDecision: {
      ...mockDecision,
      updatedAt: undefined,
      updatedByName: undefined,
    },
  },
};

export const WithWorkspaceSources: Story = {
  args: {
    result: {
      ...mockResult,
      workspaceData: {
        documentSources: [
          'https://internal-docs.company.com/laptops',
        ],
      },
    },
    currentDecision: mockDecision,
  },
};
