import type { Meta, StoryObj } from '@storybook/react';
import { EditableTitle } from './EditableTitle';
import { useState } from 'react';

const meta = {
  title: 'Core/EditableTitle',
  component: EditableTitle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditableTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [title, setTitle] = useState('Which laptop should I buy?');
    return (
      <EditableTitle
        title={title}
        onTitleChange={setTitle}
        onTitleEdit={(newTitle) => console.log('Title edited:', newTitle)}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [title] = useState('Which laptop should I buy?');
    return (
      <EditableTitle
        title={title}
        onTitleChange={() => {}}
        disabled={true}
      />
    );
  },
};

export const LongTitle: Story = {
  render: () => {
    const [title, setTitle] = useState(
      'Which laptop should I buy for software development, video editing, and gaming?'
    );
    return (
      <EditableTitle
        title={title}
        onTitleChange={setTitle}
        onTitleEdit={(newTitle) => console.log('Title edited:', newTitle)}
      />
    );
  },
};
