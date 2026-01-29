import type { Meta, StoryObj } from '@storybook/react';
import AnalysisResult from './AnalysisResult';
import { IResult, IDecision } from '@/types/decision';

// Mock data
const mockResult: IResult = {
  recommendation: 'MacBook Pro',
  description: 'Based on your needs, the MacBook Pro offers the best combination of performance, build quality, and ecosystem integration.',
  breakdown: [
    {
      option: 'MacBook Pro',
      description: 'High-performance laptop with excellent build quality.',
      pros: ['Powerful M-series chip', 'Excellent display', 'Long battery life'],
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
    {
      option: 'ThinkPad X1 Carbon',
      description: 'Business-focused laptop known for durability.',
      pros: ['Excellent keyboard', 'Very durable'],
      cons: ['Display could be better'],
      score: 78,
    },
  ],
};

const mockDecision: IDecision = {
  id: 'decision-1',
  dilemma: 'Which laptop should I buy?',
  result: mockResult,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const meta = {
  title: 'DecisionMaker/AnalysisResult',
  component: AnalysisResult,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AnalysisResult>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    result: mockResult,
    isUpdating: false,
    analysisStep: 'done',
    currentDecision: mockDecision,
    dilemma: 'Which laptop should I buy?',
    onUpdateDecision: (decision) => console.log('Update decision:', decision),
    onFollowUpQuestion: (dilemma) => console.log('Follow-up question:', dilemma),
    onEditOptions: () => console.log('Edit options'),
  },
};

export const Updating: Story = {
  args: {
    ...Default.args,
    isUpdating: true,
  },
};

export const NoResult: Story = {
  args: {
    result: null,
    isUpdating: false,
    analysisStep: 'idle',
    currentDecision: null,
    dilemma: 'Which laptop should I buy?',
  },
};

export const SingleOption: Story = {
  args: {
    ...Default.args,
    result: {
      ...mockResult,
      breakdown: [mockResult.breakdown[0]],
    },
  },
};
