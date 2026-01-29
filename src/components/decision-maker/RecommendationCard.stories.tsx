import type { Meta, StoryObj } from '@storybook/react';
import { RecommendationCard } from './RecommendationCard';
import { IResult } from '@/types/decision';

// Mock data
const mockResult: IResult = {
  recommendation: 'MacBook Pro',
  description: 'Based on your needs, the MacBook Pro offers the best combination of performance, build quality, and ecosystem integration.',
  breakdown: [
    {
      option: 'MacBook Pro',
      description: 'High-performance laptop with excellent build quality and macOS ecosystem.',
      pros: ['Powerful M-series chip', 'Excellent display', 'Long battery life', 'Great build quality'],
      cons: ['Expensive', 'Limited upgradeability'],
      score: 92,
    },
    {
      option: 'Dell XPS 15',
      description: 'Premium Windows laptop with great performance.',
      pros: ['Great performance', 'Beautiful display'],
      cons: ['Can get hot', 'Battery life'],
      score: 85,
    },
  ],
  infoLinks: [
    { title: 'Apple MacBook Pro', url: 'https://apple.com/macbook-pro', description: 'Official product page' },
  ],
  shoppingLinks: [
    { title: 'Buy on Amazon', url: 'https://amazon.com/macbook-pro', description: 'Check price on Amazon' },
  ],
};

const meta = {
  title: 'DecisionMaker/RecommendationCard',
  component: RecommendationCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    result: mockResult,
    dilemma: 'Which laptop should I buy?',
    currentDecision: { id: 'mock-decision-id' },
  },
};

export const WithEditOptions: Story = {
  args: {
    result: mockResult,
    dilemma: 'Which laptop should I buy?',
    currentDecision: { id: 'mock-decision-id' },
    onEditOptions: () => console.log('Edit options clicked'),
  },
};
