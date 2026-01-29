import type { Meta, StoryObj } from '@storybook/react';
import { CommentsPanel } from './CommentsPanel';

const meta = {
  title: 'Comments/CommentsPanel',
  component: CommentsPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommentsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    decisionId: 'mock-decision-id',
    commentsCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'The CommentsPanel opens as a Sheet from the right side. Click the trigger button to open it.',
      },
    },
  },
};

export const WithComments: Story = {
  args: {
    decisionId: 'mock-decision-id',
    commentsCount: 3,
  },
};
