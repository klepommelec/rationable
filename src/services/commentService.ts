
import { supabase } from '@/integrations/supabase/client';
import { IComment, ICommentCreate } from '@/types/comment';

export const commentService = {
  async getComments(decisionId: string): Promise<IComment[]> {
    const { data, error } = await supabase
      .from('decision_comments')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return (data || []).map(comment => ({
      ...comment,
      comment_type: comment.comment_type as 'general' | 'criteria' | 'option' | 'recommendation'
    }));
  },

  async createComment(comment: ICommentCreate): Promise<IComment | null> {
    const { data, error } = await supabase
      .from('decision_comments')
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }

    return data ? {
      ...data,
      comment_type: data.comment_type as 'general' | 'criteria' | 'option' | 'recommendation'
    } : null;
  },

  async updateComment(commentId: string, content: string): Promise<IComment | null> {
    const { data, error } = await supabase
      .from('decision_comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return null;
    }

    return data ? {
      ...data,
      comment_type: data.comment_type as 'general' | 'criteria' | 'option' | 'recommendation'
    } : null;
  },

  async deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('decision_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  }
};
