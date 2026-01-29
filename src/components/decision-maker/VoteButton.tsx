import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import { votingService, VotingPermissions } from '@/services/votingService';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VoterAvatar {
  user_id: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
}

interface VoteButtonProps {
  decisionId: string;
  optionName: string;
  initialVoteCount?: number;
  initialHasVoted?: boolean;
  onVoteChange?: (optionName: string, newCount: number, hasVoted: boolean) => void;
  className?: string;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  decisionId,
  optionName,
  initialVoteCount = 0,
  initialHasVoted = false,
  onVoteChange,
  className = ""
}) => {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);
  const [recentVoters, setRecentVoters] = useState<VoterAvatar[]>([]);

  // Update state when props change
  useEffect(() => {
    setVoteCount(initialVoteCount);
    setHasVoted(initialHasVoted);
  }, [initialVoteCount, initialHasVoted]);

  // Load recent voters
  useEffect(() => {
    const loadRecentVoters = async () => {
      if (voteCount > 0) {
        try {
          const voters = await votingService.getRecentVoters(decisionId, optionName, 3);
          setRecentVoters(voters);
        } catch (error) {
          console.error('Error loading recent voters:', error);
        }
      }
    };
    loadRecentVoters();
  }, [decisionId, optionName, voteCount]);

  const handleVote = async () => {
    if (!user || isLoading) {
      return;
    }

    console.log('🗳️ Vote button clicked:', { decisionId, optionName, userId: user.id });
    setIsLoading(true);
    try {
      const result = await votingService.toggleVote(decisionId, optionName, user.id);
      console.log('✅ Vote result:', result);
      
      setHasVoted(result.voted);
      const newCount = result.voted ? voteCount + 1 : voteCount - 1;
      setVoteCount(newCount);
      
      // Recharger les avatars après le vote/unvote
      if (newCount > 0) {
        try {
          const voters = await votingService.getRecentVoters(decisionId, optionName, 3);
          setRecentVoters(voters);
        } catch (error) {
          console.error('Error reloading recent voters:', error);
        }
      } else {
        // Si plus de votes, vider la liste des avatars
        setRecentVoters([]);
      }
      
      // Notify parent component
      onVoteChange?.(optionName, newCount, result.voted);
    } catch (error) {
      console.error('❌ Error voting:', error);
      // Revert optimistic update
      setHasVoted(initialHasVoted);
      setVoteCount(initialVoteCount);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}>
        <ArrowUp className="h-4 w-4" />
        <span>{voteCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={`flex items-center gap-1 ${hasVoted ? 'border-black border' : ''} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowUp className="h-4 w-4" />
      )}
      <span>{voteCount}</span>
      
      {/* Avatars des 3 derniers votants */}
      {recentVoters.length > 0 && (
        <div className="flex -space-x-1 ml-1">
          {recentVoters.slice(0, 3).map((voter, index) => (
            <Avatar key={voter.user_id} className="h-5 w-5 border border-white rounded-full overflow-hidden">
              <AvatarImage 
                src={voter.avatar_url} 
                alt={voter.full_name || 'Voter'} 
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                {voter.full_name ? voter.full_name.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </Button>
  );
};
