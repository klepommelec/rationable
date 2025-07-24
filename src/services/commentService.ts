import { supabase } from '@/integrations/supabase/client';
import { IComment, ICommentCreate } from '@/types/comment';
import { sanitizeComment } from '@/utils/inputSanitization';

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
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    // Sanitize content before inserting
    const sanitizedComment = {
      ...comment,
      content: sanitizeComment(comment.content),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('decision_comments')
      .insert(sanitizedComment)
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
    // Get current user for security check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    // Sanitize content before updating
    const sanitizedContent = sanitizeComment(content);

    const { data, error } = await supabase
      .from('decision_comments')
      .update({ content: sanitizedContent, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', user.id) // Ensure user can only update their own comments
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
    // Get current user for security check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('decision_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id); // Ensure user can only delete their own comments

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  }
};