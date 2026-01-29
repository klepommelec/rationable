import type { Meta, StoryObj } from '@storybook/react';
import { VoteButton } from './VoteButton';

const meta = {
  title: 'DecisionMaker/VoteButton',
  component: VoteButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VoteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    decisionId: 'mock-decision-id',
    optionName: 'MacBook Pro',
    initialVoteCount: 5,
    initialHasVoted: false,
    onVoteChange: (optionName, count, hasVoted) =>
      console.log('Vote changed:', { optionName, count, hasVoted }),
  },
};

export const Voted: Story = {
  args: {
    decisionId: 'mock-decision-id',
    optionName: 'MacBook Pro',
    initialVoteCount: 5,
    initialHasVoted: true,
  },
};

export const NoVotes: Story = {
  args: {
    decisionId: 'mock-decision-id',
    optionName: 'Dell XPS 15',
    initialVoteCount: 0,
    initialHasVoted: false,
  },
};

export const ManyVotes: Story = {
  args: {
    decisionId: 'mock-decision-id',
    optionName: 'MacBook Pro',
    initialVoteCount: 42,
    initialHasVoted: false,
  },
};
