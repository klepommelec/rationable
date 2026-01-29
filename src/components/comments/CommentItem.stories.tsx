import type { Meta, StoryObj } from '@storybook/react';
import { CommentItem } from './CommentItem';
import { IComment } from '@/types/comment';

// Mock data
const mockComment: IComment = {
  id: 'comment-1',
  decision_id: 'decision-1',
  content: 'This is a great analysis! I think Option 1 is the best choice.',
  comment_type: 'general',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'user-1',
  user: {
    id: 'user-1',
    email: 'user@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://github.com/shadcn.png',
    },
  },
  replies: [],
  reactions: [],
};

const mockCommentWithReplies: IComment = {
  ...mockComment,
  id: 'comment-2',
  replies: [
    {
      id: 'reply-1',
      decision_id: 'decision-1',
      content: 'I agree with your point!',
      comment_type: 'general',
      parent_id: 'comment-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-2',
      user: {
        id: 'user-2',
        email: 'user2@example.com',
        user_metadata: {
          full_name: 'Jane Smith',
        },
      },
    },
  ],
  reactions: [
    {
      id: 'reaction-1',
      comment_id: 'comment-2',
      user_id: 'user-3',
      emoji: '👍',
      created_at: new Date().toISOString(),
    },
  ],
};

const meta = {
  title: 'Comments/CommentItem',
  component: CommentItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    comment: mockComment,
    onUpdate: async (id, content) => {
      console.log('Update comment', id, content);
    },
    onDelete: async (id) => {
      console.log('Delete comment', id);
    },
    onAddReply: async (parentId, content) => {
      console.log('Add reply', parentId, content);
    },
    onUpdateReply: async (replyId, content) => {
      console.log('Update reply', replyId, content);
    },
    onDeleteReply: async (replyId) => {
      console.log('Delete reply', replyId);
    },
    onAddReaction: async (commentId, emoji) => {
      console.log('Add reaction', commentId, emoji);
    },
    onRemoveReaction: async (reactionId) => {
      console.log('Remove reaction', reactionId);
    },
  },
};

export const WithReplies: Story = {
  args: {
    comment: mockCommentWithReplies,
    onUpdate: async (id, content) => {
      console.log('Update comment', id, content);
    },
    onDelete: async (id) => {
      console.log('Delete comment', id);
    },
    onAddReply: async (parentId, content) => {
      console.log('Add reply', parentId, content);
    },
    onUpdateReply: async (replyId, content) => {
      console.log('Update reply', replyId, content);
    },
    onDeleteReply: async (replyId) => {
      console.log('Delete reply', replyId);
    },
    onAddReaction: async (commentId, emoji) => {
      console.log('Add reaction', commentId, emoji);
    },
    onRemoveReaction: async (reactionId) => {
      console.log('Remove reaction', reactionId);
    },
  },
};
