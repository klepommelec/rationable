import type { Meta, StoryObj } from '@storybook/react';
import TemplateCard from './TemplateCard';
import { IDecision } from '@/types/decision';

// Mock data
const mockTemplate = {
  id: 'template-1',
  title: 'Choosing a Laptop',
  description: 'Help decide which laptop to buy based on your needs',
  category: 'tech',
  tags: ['technology', 'purchase', 'laptop'],
  like_count: 42,
  author_name: 'John Doe',
  decision_data: {
    id: 'decision-1',
    dilemma: 'Which laptop should I buy for software development?',
    emoji: '💻',
  } as IDecision,
};

const meta = {
  title: 'Templates/TemplateCard',
  component: TemplateCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    template: mockTemplate,
    onOpen: (template) => console.log('Open template:', template),
  },
};

export const WithoutAuthor: Story = {
  args: {
    template: {
      ...mockTemplate,
      author_name: undefined,
    },
    onOpen: (template) => console.log('Open template:', template),
  },
};

export const WithoutLikes: Story = {
  args: {
    template: {
      ...mockTemplate,
      like_count: 0,
    },
    onOpen: (template) => console.log('Open template:', template),
  },
};

export const Popular: Story = {
  args: {
    template: {
      ...mockTemplate,
      like_count: 150,
    },
    onOpen: (template) => console.log('Open template:', template),
  },
};
