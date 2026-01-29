import type { Meta, StoryObj } from '@storybook/react';
import FollowUpQuestions from './FollowUpQuestions';
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
  followUpQuestions: [
    {
      id: 'q1',
      text: 'What is your budget range?',
      category: 'practical_info',
    },
    {
      id: 'q2',
      text: 'Do you need Windows compatibility?',
      category: 'practical_info',
    },
    {
      id: 'q3',
      text: 'What are your main use cases?',
      category: 'optimization',
    },
  ],
};

const meta = {
  title: 'DecisionMaker/FollowUpQuestions',
  component: FollowUpQuestions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FollowUpQuestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dilemma: 'Which laptop should I buy?',
    result: mockResult,
    onQuestionSelect: (enrichedDilemma, questionText) =>
      console.log('Question selected:', { enrichedDilemma, questionText }),
    onCacheQuestions: (questions) => console.log('Cache questions:', questions),
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    result: {
      ...mockResult,
      followUpQuestions: undefined,
    },
    isLoading: true,
  },
};

export const NoQuestions: Story = {
  args: {
    ...Default.args,
    result: {
      ...mockResult,
      followUpQuestions: [],
    },
  },
};
