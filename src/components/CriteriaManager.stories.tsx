import type { Meta, StoryObj } from '@storybook/react';
import { CriteriaManager } from './CriteriaManager';
import { ICriterion } from '@/types/decision';
import { useState } from 'react';

// Mock data
const mockCriteria: ICriterion[] = [
  { id: '1', name: 'Performance' },
  { id: '2', name: 'Price' },
  { id: '3', name: 'Battery Life' },
  { id: '4', name: 'Build Quality' },
];

const meta = {
  title: 'Core/CriteriaManager',
  component: CriteriaManager,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CriteriaManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [criteria, setCriteria] = useState<ICriterion[]>(mockCriteria);
    return (
      <CriteriaManager
        criteria={criteria}
        setCriteria={setCriteria}
        isInteractionDisabled={false}
        onUpdateAnalysis={() => console.log('Update analysis')}
        hasChanges={false}
        isNewDecision={false}
        isManualDecision={false}
      />
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [criteria, setCriteria] = useState<ICriterion[]>([]);
    return (
      <CriteriaManager
        criteria={criteria}
        setCriteria={setCriteria}
        isInteractionDisabled={false}
        onUpdateAnalysis={() => console.log('Update analysis')}
        hasChanges={false}
        isNewDecision={true}
        isManualDecision={false}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [criteria, setCriteria] = useState<ICriterion[]>(mockCriteria);
    return (
      <CriteriaManager
        criteria={criteria}
        setCriteria={setCriteria}
        isInteractionDisabled={true}
        onUpdateAnalysis={() => console.log('Update analysis')}
        hasChanges={false}
        isNewDecision={false}
        isManualDecision={false}
      />
    );
  },
};

export const WithChanges: Story = {
  render: () => {
    const [criteria, setCriteria] = useState<ICriterion[]>(mockCriteria);
    return (
      <CriteriaManager
        criteria={criteria}
        setCriteria={setCriteria}
        isInteractionDisabled={false}
        onUpdateAnalysis={() => console.log('Update analysis')}
        hasChanges={true}
        isNewDecision={false}
        isManualDecision={false}
      />
    );
  },
};
