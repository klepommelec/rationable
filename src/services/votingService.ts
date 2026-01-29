import { supabase } from '@/integrations/supabase/client';

export type ParticipantRole = 'observer' | 'contributor';

export interface DecisionParticipant {
  id: string;
  decision_id: string;
  user_id: string;
  role: ParticipantRole;
  invited_by?: string;
  joined_at: string;
  created_at: string;
}

export interface DecisionVote {
  id: string;
  decision_id: string;
  option_name: string;
  user_id: string;
  created_at: string;
}

export interface VoteCount {
  option_name: string;
  vote_count: number;
}

export interface VotingPermissions {
  canVote: boolean;
  canComment: boolean;
  canModify: boolean;
  canAskFollowUp: boolean;
  canPlan: boolean;
  role: ParticipantRole | null;
}

class VotingService {
  /**
   * Add a participant to a decision
   */
  async addParticipant(
    decisionId: string, 
    userId: string, 
    role: ParticipantRole = 'observer',
    invitedBy?: string
  ): Promise<DecisionParticipant | null> {
    try {
      const { data, error } = await supabase
        .from('decision_participants')
        .insert({
          decision_id: decisionId,
          user_id: userId,
          role,
          invited_by: invitedBy
        })
        .select()
        .single();

      if (error) {
        // Si le participant existe déjà (code 23505 = unique violation), le récupérer
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          console.log('Participant already exists, fetching existing:', { decisionId, userId });
          const { data: existingData, error: fetchError } = await supabase
            .from('decision_participants')
            .select('*')
            .eq('decision_id', decisionId)
            .eq('user_id', userId)
            .single();
          
          if (fetchError) {
            console.error('Error fetching existing participant:', fetchError);
            return null;
          }
          
          return existingData;
        }
        
        console.error('Error adding participant:', error);
        // Ne pas throw pour ne pas bloquer l'UI, retourner null
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in addParticipant:', err);
      return null; // Retourner null au lieu de throw pour ne pas bloquer
    }
  }

  /**
   * Get all participants for a decision
   */
  async getDecisionParticipants(decisionId: string): Promise<DecisionParticipant[]> {
    const { data, error } = await supabase
      .from('decision_participants')
      .select('*')
      .eq('decision_id', decisionId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get user's role in a decision
   */
  async getUserRole(decisionId: string, userId: string): Promise<ParticipantRole | null> {
    const { data, error } = await supabase
      .from('decision_participants')
      .select('role')
      .eq('decision_id', decisionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user is not a participant
        return null;
      }
      console.error('Error fetching user role:', error);
      throw error;
    }

    return data.role;
  }

  /**
   * Update user's role in a decision
   */
  async updateUserRole(
    decisionId: string, 
    userId: string, 
    newRole: ParticipantRole
  ): Promise<DecisionParticipant> {
    const { data, error } = await supabase
      .from('decision_participants')
      .update({ role: newRole })
      .eq('decision_id', decisionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a participant from a decision
   */
  async removeParticipant(decisionId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('decision_participants')
      .delete()
      .eq('decision_id', decisionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  /**
   * Vote for an option (+1 vote)
   */
  async voteForOption(
    decisionId: string, 
    optionName: string, 
    userId: string
  ): Promise<DecisionVote> {
    try {
      const { data, error } = await supabase
        .from('decision_votes')
        .insert({
          decision_id: decisionId,
          option_name: optionName,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        // Handle 406 errors with a more user-friendly message
        if (error.status === 406 || error.message?.includes('406')) {
          const customError = new Error('Vous n\'avez pas la permission de voter sur cette décision');
          (customError as any).status = 406;
          console.error('Vote blocked (406):', { decisionId, optionName, userId });
          throw customError;
        }
        console.error('Error voting for option:', error);
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw to let the UI handle it
      throw err;
    }
  }

  /**
   * Remove vote for an option
   */
  async removeVote(
    decisionId: string, 
    optionName: string, 
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('decision_votes')
        .delete()
        .eq('decision_id', decisionId)
        .eq('option_name', optionName)
        .eq('user_id', userId);

      if (error) {
        // Handle 406 errors with a more user-friendly message
        if (error.status === 406 || error.message?.includes('406')) {
          const customError = new Error('Vous n\'avez pas la permission de retirer votre vote');
          (customError as any).status = 406;
          console.error('Vote removal blocked (406):', { decisionId, optionName, userId });
          throw customError;
        }
        console.error('Error removing vote:', error);
        throw error;
      }
    } catch (err) {
      // Re-throw to let the UI handle it
      throw err;
    }
  }

  /**
   * Check if user has voted for an option
   */
  async hasUserVoted(
    decisionId: string, 
    optionName: string, 
    userId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('decision_votes')
        .select('id')
        .eq('decision_id', decisionId)
        .eq('option_name', optionName)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user hasn't voted
          return false;
        }
        // Handle 406 errors gracefully (RLS or permission issues)
        if (error.status === 406 || error.message?.includes('406')) {
          console.warn('Vote check blocked (406):', { decisionId, optionName, userId });
          return false; // Default to not voted if access is blocked
        }
        console.error('Error checking vote:', error);
        // Don't throw, return false as safe default
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Exception in hasUserVoted:', err);
      return false; // Safe default
    }
  }

  /**
   * Get vote counts for all options in a decision
   */
  async getVoteCounts(decisionId: string): Promise<VoteCount[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_decision_vote_counts', { decision_id_param: decisionId });

      if (error) {
        // Handle 406 errors gracefully (RLS or permission issues)
        if (error.status === 406 || error.message?.includes('406')) {
          console.warn('Vote counts blocked (406):', { decisionId });
          return []; // Return empty array if access is blocked
        }
        console.error('Error fetching vote counts:', error);
        // Don't throw, return empty array as safe default
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception in getVoteCounts:', err);
      return []; // Safe default
    }
  }

  /**
   * Get all votes for a decision (with user info)
   */
  async getDecisionVotes(decisionId: string): Promise<DecisionVote[]> {
    try {
      const { data, error } = await supabase
        .from('decision_votes')
        .select('*')
        .eq('decision_id', decisionId)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle 406 errors gracefully (RLS or permission issues)
        if (error.status === 406 || error.message?.includes('406')) {
          console.warn('Decision votes blocked (406):', { decisionId });
          return []; // Return empty array if access is blocked
        }
        console.error('Error fetching votes:', error);
        // Don't throw, return empty array as safe default
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Exception in getDecisionVotes:', err);
      return []; // Safe default
    }
  }

  /**
   * Get user's voting permissions for a decision
   */
  async getUserPermissions(decisionId: string, userId: string): Promise<VotingPermissions> {
    const role = await this.getUserRole(decisionId, userId);
    
    if (!role) {
      return {
        canVote: false,
        canComment: false,
        canModify: false,
        canAskFollowUp: false,
        canPlan: false,
        role: null
      };
    }

    return {
      canVote: true, // Both observers and contributors can vote
      canComment: true, // Both observers and contributors can comment
      canModify: role === 'contributor',
      canAskFollowUp: role === 'contributor',
      canPlan: role === 'contributor', // Will be available later
      role
    };
  }

  /**
   * Toggle vote for an option (vote if not voted, remove vote if already voted)
   */
  async toggleVote(
    decisionId: string, 
    optionName: string, 
    userId: string
  ): Promise<{ voted: boolean; vote?: DecisionVote }> {
    const hasVoted = await this.hasUserVoted(decisionId, optionName, userId);
    
    if (hasVoted) {
      await this.removeVote(decisionId, optionName, userId);
      return { voted: false };
    } else {
      const vote = await this.voteForOption(decisionId, optionName, userId);
      return { voted: true, vote };
    }
  }

  /**
   * Get recent voters for an option with their profile info
   */
  async getRecentVoters(decisionId: string, optionName: string, limit: number = 3): Promise<Array<{
    user_id: string;
    avatar_url?: string;
    full_name?: string;
    created_at: string;
  }>> {
    const { data, error } = await supabase.rpc('get_recent_voters_with_profiles', {
      decision_id_param: decisionId,
      option_name_param: optionName,
      limit_param: limit,
    });

    if (error) {
      console.error('Error fetching recent voters:', error);
      throw error;
    }

    return (data || []).map(vote => ({
      user_id: vote.user_id,
      avatar_url: vote.avatar_url,
      full_name: vote.full_name,
      created_at: vote.created_at,
    }));
  }
}

export const votingService = new VotingService();
