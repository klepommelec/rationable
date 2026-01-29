import type { Meta, StoryObj } from '@storybook/react';
import DilemmaSetup from './DilemmaSetup';
import { IDecision } from '@/types/decision';

// Mock data
const mockHistory: IDecision[] = [
  {
    id: '1',
    dilemma: 'Which laptop should I buy?',
    result: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    dilemma: 'Should I move to a new city?',
    result: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTemplates = [
  { name: 'Buying a car', dilemma: 'Which car should I buy?' },
  { name: 'Choosing a job', dilemma: 'Which job offer should I accept?' },
];

const meta = {
  title: 'DecisionMaker/DilemmaSetup',
  component: DilemmaSetup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DilemmaSetup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dilemma: '',
    setDilemma: (dilemma: string) => console.log('Set dilemma:', dilemma),
    analysisStep: 'idle',
    setAnalysisStep: (step) => console.log('Set step:', step),
    isLoading: false,
    isUpdating: false,
    applyTemplate: (template) => console.log('Apply template:', template),
    clearSession: () => console.log('Clear session'),
    clearAnalyses: () => console.log('Clear analyses'),
    history: mockHistory,
    loadDecision: (id) => console.log('Load decision:', id),
    deleteDecision: (id) => console.log('Delete decision:', id),
    clearHistory: () => console.log('Clear history'),
    handleStartAnalysis: () => console.log('Start analysis'),
    progress: 0,
    progressMessage: '',
    setProgressMessage: (msg) => console.log('Set progress:', msg),
    templates: mockTemplates,
    selectedCategory: undefined,
    onCategoryChange: (cat) => console.log('Category change:', cat),
    onUpdateCategory: (id, cat) => console.log('Update category:', id, cat),
    uploadedFiles: [],
    setUploadedFiles: (files) => console.log('Set files:', files),
    addDecision: (decision) => console.log('Add decision:', decision),
    setCurrentDecisionId: (id) => console.log('Set current decision ID:', id),
  },
};

export const WithDilemma: Story = {
  args: {
    ...Default.args,
    dilemma: 'Which laptop should I buy for software development?',
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    dilemma: 'Which laptop should I buy?',
    isLoading: true,
    progress: 45,
    progressMessage: 'Analyzing your dilemma...',
  },
};
