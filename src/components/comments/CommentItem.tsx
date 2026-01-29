
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit2, Trash2, Save, X, MoreHorizontal, Reply, Smile } from 'lucide-react';
import { IComment } from '@/types/comment';
import { toast } from 'sonner';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { MentionRenderer } from './MentionRenderer';
import { CommentReactions } from './CommentReactions';
import { CommentReplies } from './CommentReplies';
import { useAuth } from '@/hooks/useAuth';

interface CommentItemProps {
  comment: IComment;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onAddReply?: (parentId: string, content: string) => Promise<void>;
  onUpdateReply?: (replyId: string, content: string) => Promise<void>;
  onDeleteReply?: (replyId: string) => Promise<void>;
  onAddReaction?: (commentId: string, emoji: string) => Promise<void>;
  onRemoveReaction?: (reactionId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete,
  onAddReply,
  onUpdateReply,
  onDeleteReply,
  onAddReaction,
  onRemoveReaction
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);
  const { t, getLocaleTag, currentLanguage } = useI18nUI();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error(t('common.error'));
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
      toast.success(t('comments.section.toasts.updateSuccess'));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(comment.id);
      toast.success(t('comments.section.toasts.deleteSuccess'));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = getLocaleTag(currentLanguage);
    return new Date(dateString).toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    return t(`comments.item.types.${type}` as any) || t('comments.item.types.general');
  };

  const handleAddReaction = async (emoji: string) => {
    if (onAddReaction) {
      try {
        await onAddReaction(comment.id, emoji);
      } catch (error) {
        console.error('Error adding reaction:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleRemoveReaction = async (reactionId: string) => {
    if (onRemoveReaction) {
      try {
        await onRemoveReaction(reactionId);
      } catch (error) {
        console.error('Error removing reaction:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleAddReply = async (content: string) => {
    if (onAddReply) {
      try {
        await onAddReply(comment.id, content);
        toast.success(t('comments.section.toasts.addSuccess'));
      } catch (error) {
        console.error('Error adding reply:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleUpdateReply = async (replyId: string, content: string) => {
    if (onUpdateReply) {
      try {
        await onUpdateReply(replyId, content);
        toast.success(t('comments.section.toasts.updateSuccess'));
      } catch (error) {
        console.error('Error updating reply:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (onDeleteReply) {
      try {
        await onDeleteReply(replyId);
        toast.success(t('comments.section.toasts.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting reply:', error);
        toast.error(t('common.error'));
      }
    }
  };

  return (
    <Card className="p-4 space-y-3 group mt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage 
              src={comment.user?.user_metadata?.avatar_url || undefined} 
              className="object-cover"
            />
            <AvatarFallback className="text-xs">
              {comment.user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {comment.user?.user_metadata?.full_name || 'Utilisateur'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Bouton Add Reaction - visible au hover si pas de réactions */}
          {(!comment.reactions || comment.reactions.length === 0) && (
            <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-4 gap-1">
                  {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={async () => {
                        if (onAddReaction) {
                          try {
                            await onAddReaction(comment.id, emoji);
                            setIsReactionPopoverOpen(false);
                          } catch (error) {
                            console.error('Error adding reaction:', error);
                            toast.error(t('common.error'));
                          }
                        }
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Bouton Reply - visible au hover */}
          {!comment.parent_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplyFormOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="h-3 w-3 mr-1" />
              {t('comments.item.reply')}
            </Button>
          )}
          
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3 w-3 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Partagez votre commentaire, note ou réflexion..."
          className="min-h-[80px]"
          disabled={isLoading}
        />
      ) : (
        <div className="text-sm text-foreground">
          <MentionRenderer text={comment.content} />
        </div>
      )}

      {/* Réactions - visibles si il y en a, sinon au hover */}
      <div className={`transition-opacity ${
        (comment.reactions && comment.reactions.length > 0) 
          ? 'opacity-100' 
          : 'opacity-0 group-hover:opacity-100'
      }`}>
        <CommentReactions
          reactions={comment.reactions || []}
          currentUserId={user?.id}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
        />
      </div>

      {/* Réponses - visibles si il y en a, sinon au hover */}
      {!comment.parent_id && (
        <div className={`transition-opacity ${
          (comment.replies && comment.replies.length > 0) 
            ? 'opacity-100' 
            : 'opacity-0 group-hover:opacity-100'
        }`}>
          <CommentReplies
            comment={comment}
            replies={comment.replies || []}
            onAddReply={handleAddReply}
            onUpdateReply={handleUpdateReply}
            onDeleteReply={handleDeleteReply}
            isReplyFormOpen={isReplyFormOpen}
            onReplyFormToggle={setIsReplyFormOpen}
          />
        </div>
      )}
    </Card>
  );
};
