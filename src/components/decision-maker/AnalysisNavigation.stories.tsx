import type { Meta, StoryObj } from '@storybook/react';
import AnalysisNavigation from './AnalysisNavigation';

// Mock data
const mockAnalyses = [
  {
    id: 'analysis-1',
    dilemma: 'Which laptop should I buy?',
    displayTitle: 'Laptop Choice',
    result: null,
    emoji: '💻',
    analysisStep: 'done',
  },
  {
    id: 'analysis-2',
    dilemma: 'Should I move to a new city?',
    displayTitle: 'City Move',
    result: null,
    emoji: '🏙️',
    analysisStep: 'done',
  },
  {
    id: 'analysis-3',
    dilemma: 'Which car should I buy?',
    displayTitle: 'Car Purchase',
    result: null,
    emoji: '🚗',
    analysisStep: 'done',
  },
];

const meta = {
  title: 'DecisionMaker/AnalysisNavigation',
  component: AnalysisNavigation,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AnalysisNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    analyses: mockAnalyses,
    currentAnalysisIndex: 0,
    onNavigate: (index) => console.log('Navigate to:', index),
  },
};

export const SecondAnalysis: Story = {
  args: {
    analyses: mockAnalyses,
    currentAnalysisIndex: 1,
    onNavigate: (index) => console.log('Navigate to:', index),
  },
};

export const LastAnalysis: Story = {
  args: {
    analyses: mockAnalyses,
    currentAnalysisIndex: 2,
    onNavigate: (index) => console.log('Navigate to:', index),
  },
};

export const SingleAnalysis: Story = {
  args: {
    analyses: [mockAnalyses[0]],
    currentAnalysisIndex: 0,
    onNavigate: (index) => console.log('Navigate to:', index),
  },
  parameters: {
    docs: {
      description: {
        story: 'The component returns null when there is only one analysis.',
      },
    },
  },
};
