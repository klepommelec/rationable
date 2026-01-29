import type { Meta, StoryObj } from '@storybook/react';
import { ComparisonTable } from './ComparisonTable';
import { IBreakdownItem, IResult } from '@/types/decision';

// Mock data
const mockBreakdown: IBreakdownItem[] = [
  {
    option: 'Option 1: MacBook Pro',
    description: 'High-performance laptop with excellent build quality and macOS ecosystem.',
    pros: ['Powerful M-series chip', 'Excellent display', 'Long battery life'],
    cons: ['Expensive', 'Limited upgradeability'],
    score: 92,
  },
  {
    option: 'Option 2: Dell XPS 15',
    description: 'Premium Windows laptop with great performance and display.',
    pros: ['Great performance', 'Beautiful display', 'Good build quality'],
    cons: ['Can get hot under load', 'Battery life could be better'],
    score: 85,
  },
  {
    option: 'Option 3: ThinkPad X1 Carbon',
    description: 'Business-focused laptop known for durability and keyboard.',
    pros: ['Excellent keyboard', 'Very durable', 'Lightweight'],
    cons: ['Display could be better', 'Less powerful than competitors'],
    score: 78,
  },
];

const mockResult: IResult = {
  recommendation: 'MacBook Pro',
  description: 'Based on your needs, the MacBook Pro offers the best combination of performance and ecosystem.',
  breakdown: mockBreakdown,
};

const meta = {
  title: 'DecisionMaker/ComparisonTable',
  component: ComparisonTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    breakdown: mockBreakdown,
    dilemma: 'Which laptop should I buy?',
    result: mockResult,
  },
};

export const WithVoting: Story = {
  args: {
    breakdown: mockBreakdown,
    dilemma: 'Which laptop should I buy?',
    result: mockResult,
    decisionId: 'mock-decision-id',
    showVoting: true,
  },
};

export const CardsView: Story = {
  args: {
    breakdown: mockBreakdown,
    dilemma: 'Which laptop should I buy?',
    result: mockResult,
  },
  parameters: {
    docs: {
      description: {
        story: 'The component defaults to cards view on mobile and can be toggled to table view.',
      },
    },
  },
};
