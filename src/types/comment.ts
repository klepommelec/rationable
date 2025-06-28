
export interface IComment {
  id: string;
  decision_id: string;
  content: string;
  comment_type: 'general' | 'criteria' | 'option' | 'recommendation';
  step_context?: string; // For criteria name, option name, etc.
  created_at: string;
  updated_at: string;
}

export interface ICommentCreate {
  decision_id: string;
  content: string;
  comment_type: 'general' | 'criteria' | 'option' | 'recommendation';
  step_context?: string;
}
