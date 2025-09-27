
export interface IComment {
  id: string;
  decision_id: string;
  content: string;
  comment_type: 'general' | 'criteria' | 'option' | 'recommendation';
  step_context?: string; // For criteria name, option name, etc.
  parent_id?: string; // For replies to comments
  created_at: string;
  updated_at: string;
  user_id: string;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  replies?: IComment[]; // Nested replies
  reactions?: ICommentReaction[]; // Emoji reactions
}

export interface ICommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface ICommentCreate {
  decision_id: string;
  content: string;
  comment_type: 'general' | 'criteria' | 'option' | 'recommendation';
  step_context?: string;
  parent_id?: string; // For replies
}

export interface ICommentReactionCreate {
  comment_id: string;
  emoji: string;
}
