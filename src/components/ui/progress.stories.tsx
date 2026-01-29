import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 33,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const AlmostComplete: Story = {
  args: {
    value: 90,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const Small: Story = {
  args: {
    value: 45,
    className: 'h-2',
  },
};

export const Large: Story = {
  args: {
    value: 60,
    className: 'h-6',
  },
};
