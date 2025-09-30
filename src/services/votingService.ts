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
  ): Promise<DecisionParticipant> {
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
      console.error('Error adding participant:', error);
      throw error;
    }

    return data;
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
      console.error('Error voting for option:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove vote for an option
   */
  async removeVote(
    decisionId: string, 
    optionName: string, 
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('decision_votes')
      .delete()
      .eq('decision_id', decisionId)
      .eq('option_name', optionName)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing vote:', error);
      throw error;
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
      console.error('Error checking vote:', error);
      throw error;
    }

    return !!data;
  }

  /**
   * Get vote counts for all options in a decision
   */
  async getVoteCounts(decisionId: string): Promise<VoteCount[]> {
    const { data, error } = await supabase
      .rpc('get_decision_vote_counts', { decision_id_param: decisionId });

    if (error) {
      console.error('Error fetching vote counts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all votes for a decision (with user info)
   */
  async getDecisionVotes(decisionId: string): Promise<DecisionVote[]> {
    const { data, error } = await supabase
      .from('decision_votes')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching votes:', error);
      throw error;
    }

    return data || [];
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
