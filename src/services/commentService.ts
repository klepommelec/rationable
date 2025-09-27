import { supabase } from '@/integrations/supabase/client';
import { IComment, ICommentCreate, ICommentReaction, ICommentReactionCreate } from '@/types/comment';
import { sanitizeComment } from '@/utils/inputSanitization';

export const commentService = {
  async getComments(decisionId: string): Promise<IComment[]> {
    console.log('🔍 [DEBUG] Fetching comments for decisionId:', decisionId);
    
    try {
      // Récupérer les commentaires principaux (sans parent_id)
      const { data, error } = await supabase
        .from('decision_comments')
        .select('*')
        .eq('decision_id', decisionId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DEBUG] Error fetching comments:', error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }
      
      console.log('✅ [DEBUG] Comments fetched successfully:', data?.length || 0, 'comments');

      // Get current user info to enrich comments
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get current user profile
      let currentUserProfile = null;
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        currentUserProfile = profileData;
        console.log('🔍 [DEBUG] Current user profile data:', profileData);
        console.log('🔍 [DEBUG] Current user ID:', currentUser.id);
      }

      // Enrich comments with user information, replies, and reactions
      const enrichedComments = await Promise.all((data || []).map(async (comment) => {
        const isCurrentUser = currentUser && comment.user_id === currentUser.id;
        console.log('🔍 [DEBUG] Comment user_id:', comment.user_id, 'Current user ID:', currentUser?.id, 'Is current user:', isCurrentUser);
        
        // Récupérer les réponses pour ce commentaire
        const { data: repliesData } = await supabase
          .from('decision_comments')
          .select('*')
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        // Récupérer les réactions pour ce commentaire
        const reactions = await this.getReactions(comment.id);

        const enrichedComment = {
          ...comment,
          comment_type: comment.comment_type as 'general' | 'criteria' | 'option' | 'recommendation',
          user: isCurrentUser && currentUserProfile ? {
            id: currentUser.id,
            email: currentUser.email || 'Unknown',
            user_metadata: {
              full_name: currentUserProfile.full_name || 'Utilisateur',
              avatar_url: currentUserProfile.avatar_url
            }
          } : {
            id: comment.user_id,
            email: 'Unknown',
            user_metadata: {
              full_name: 'Utilisateur',
              avatar_url: undefined
            }
          },
          replies: repliesData?.map(reply => {
            const isReplyCurrentUser = currentUser && reply.user_id === currentUser.id;
            return {
              ...reply,
              comment_type: reply.comment_type as 'general' | 'criteria' | 'option' | 'recommendation',
              user: isReplyCurrentUser && currentUserProfile ? {
                id: currentUser.id,
                email: currentUser.email || 'Unknown',
                user_metadata: {
                  full_name: currentUserProfile.full_name || 'Utilisateur',
                  avatar_url: currentUserProfile.avatar_url
                }
              } : {
                id: reply.user_id,
                email: 'Unknown',
                user_metadata: {
                  full_name: 'Utilisateur',
                  avatar_url: undefined
                }
              }
            };
          }) || [],
          reactions: reactions || []
        };
        
        console.log('🔍 [DEBUG] Enriched comment user data:', enrichedComment.user);
        return enrichedComment;
      }));

      return enrichedComments;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in getComments:', error);
      throw error;
    }
  },

  async createComment(comment: ICommentCreate): Promise<IComment | null> {
    console.log('💬 [DEBUG] Creating comment:', comment);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated:', authError?.message);
      throw new Error('Authentication required to create comments');
    }

    // Sanitize content before inserting
    const sanitizedComment = {
      ...comment,
      content: sanitizeComment(comment.content),
      user_id: user.id
    };
    
    console.log('📝 [DEBUG] Sanitized comment to insert:', sanitizedComment);

    try {
      const { data, error } = await supabase
        .from('decision_comments')
        .insert(sanitizedComment)
        .select('*')
        .single();

      if (error) {
        console.error('❌ [DEBUG] Error creating comment:', error);
        throw new Error(`Failed to create comment: ${error.message}`);
      }
      
      console.log('✅ [DEBUG] Comment created successfully:', data);

      if (!data) return null;

      // Get current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Enrich with current user info
      const enrichedComment = {
        ...data,
        comment_type: data.comment_type as 'general' | 'criteria' | 'option' | 'recommendation',
        user: {
          id: user.id,
          email: user.email || 'Unknown',
          user_metadata: {
            full_name: profileData?.full_name || 'Utilisateur',
            avatar_url: profileData?.avatar_url
          }
        }
      };

      return enrichedComment;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in createComment:', error);
      throw error;
    }
  },

  async updateComment(commentId: string, content: string): Promise<IComment | null> {
    // Get current user for security check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated:', authError?.message);
      throw new Error('Authentication required to update comments');
    }

    // Sanitize content before updating
    const sanitizedContent = sanitizeComment(content);

    try {
      const { data, error } = await supabase
        .from('decision_comments')
        .update({ 
          content: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only update their own comments
        .select('*')
        .single();

      if (error) {
        console.error('❌ [DEBUG] Error updating comment:', error);
        throw new Error(`Failed to update comment: ${error.message}`);
      }

      if (!data) return null;

      // Get current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Enrich with current user info
      const enrichedComment = {
        ...data,
        comment_type: data.comment_type as 'general' | 'criteria' | 'option' | 'recommendation',
        user: {
          id: user.id,
          email: user.email || 'Unknown',
          user_metadata: {
            full_name: profileData?.full_name || 'Utilisateur',
            avatar_url: profileData?.avatar_url
          }
        }
      };

      return enrichedComment;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in updateComment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string): Promise<boolean> {
    // Get current user for security check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated:', authError?.message);
      throw new Error('Authentication required to delete comments');
    }

    try {
      const { error } = await supabase
        .from('decision_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        console.error('❌ [DEBUG] Error deleting comment:', error);
        throw new Error(`Failed to delete comment: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in deleteComment:', error);
      throw error;
    }
  },

  // Méthodes pour les réactions
  async addReaction(reaction: ICommentReactionCreate): Promise<ICommentReaction | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated:', authError?.message);
      throw new Error('Authentication required to add reaction');
    }

    try {
      const { data, error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: reaction.comment_id,
          user_id: user.id,
          emoji: reaction.emoji
        })
        .select('*')
        .single();

      if (error) {
        console.error('❌ [DEBUG] Error adding reaction:', error);
        throw new Error(`Failed to add reaction: ${error.message}`);
      }

      if (!data) return null;

      // Get current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Enrich with current user info
      const enrichedReaction = {
        ...data,
        user: {
          id: user.id,
          email: user.email || 'Unknown',
          user_metadata: {
            full_name: profileData?.full_name || 'Utilisateur',
            avatar_url: profileData?.avatar_url
          }
        }
      };

      return enrichedReaction;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in addReaction:', error);
      throw error;
    }
  },

  async removeReaction(reactionId: string): Promise<boolean> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated:', authError?.message);
      throw new Error('Authentication required to remove reaction');
    }

    try {
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', reactionId)
        .eq('user_id', user.id); // Ensure user can only remove their own reactions

      if (error) {
        console.error('❌ [DEBUG] Error removing reaction:', error);
        throw new Error(`Failed to remove reaction: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in removeReaction:', error);
      throw error;
    }
  },

  async getReactions(commentId: string): Promise<ICommentReaction[]> {
    try {
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('*')
        .eq('comment_id', commentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [DEBUG] Error fetching reactions:', error);
        throw new Error(`Failed to fetch reactions: ${error.message}`);
      }

      // Get current user info to enrich reactions
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Get current user profile
      let currentUserProfile = null;
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        currentUserProfile = profileData;
      }

      // Enrich reactions with user info
      const enrichedReactions = (data || []).map((reaction) => {
        const isCurrentUser = currentUser && reaction.user_id === currentUser.id;
        return {
          ...reaction,
          user: isCurrentUser && currentUserProfile ? {
            id: currentUser.id,
            email: currentUser.email || 'Unknown',
            user_metadata: {
              full_name: currentUserProfile.full_name || 'Utilisateur',
              avatar_url: currentUserProfile.avatar_url
            }
          } : {
            id: reaction.user_id,
            email: 'Unknown',
            user_metadata: {
              full_name: 'Utilisateur',
              avatar_url: undefined
            }
          }
        };
      });

      return enrichedReactions;
    } catch (error) {
      console.error('❌ [DEBUG] Exception in getReactions:', error);
      throw error;
    }
  }
};