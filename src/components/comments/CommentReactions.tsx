import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ICommentReaction } from '@/types/comment';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { Smile } from 'lucide-react';

interface CommentReactionsProps {
  reactions: ICommentReaction[];
  currentUserId?: string;
  onAddReaction: (emoji: string) => Promise<void>;
  onRemoveReaction: (reactionId: string) => Promise<void>;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'];

export const CommentReactions: React.FC<CommentReactionsProps> = ({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction
}) => {
  const { t } = useI18nUI();
  const [isOpen, setIsOpen] = useState(false);

  // Grouper les réactions par emoji
  const reactionsByEmoji = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, ICommentReaction[]>);

  const handleReactionClick = async (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji && r.user_id === currentUserId);
    
    if (existingReaction) {
      await onRemoveReaction(existingReaction.id);
    } else {
      await onAddReaction(emoji);
    }
    setIsOpen(false);
  };

  const getReactionCount = (emoji: string) => {
    return reactionsByEmoji[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.emoji === emoji && r.user_id === currentUserId);
  };

  // Ne rien afficher s'il n'y a pas de réactions
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Affichage des réactions existantes */}
      {Object.entries(reactionsByEmoji).map(([emoji, emojiReactions]) => (
        <Button
          key={emoji}
          variant={hasUserReacted(emoji) ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReactionClick(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{emojiReactions.length}</span>
        </Button>
      ))}

      {/* Bouton pour ajouter une réaction */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
