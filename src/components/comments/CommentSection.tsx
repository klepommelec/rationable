import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { MentionsInput } from './MentionsInput';
import { commentService } from '@/services/commentService';
import { IComment, ICommentCreate, ICommentReaction } from '@/types/comment';
import { toast } from 'sonner';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useWorkspacesContext } from '@/contexts/WorkspacesContext';

interface CommentSectionProps {
  decisionId: string;
  commentType: 'general' | 'criteria' | 'option' | 'recommendation';
  stepContext?: string;
  title?: string;
  placeholder?: string;
  onCommentsChange?: (hasComments: boolean, isAddingComment: boolean, count: number) => void;
  externalIsAddingComment?: boolean;
  onSetIsAddingComment?: (value: boolean) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  decisionId,
  commentType,
  stepContext,
  title,
  placeholder,
  onCommentsChange,
  externalIsAddingComment,
  onSetIsAddingComment
}) => {
  const { t } = useI18nUI();
  const { currentWorkspace } = useWorkspacesContext();
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalIsAddingComment, setInternalIsAddingComment] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isAddingComment = externalIsAddingComment !== undefined ? externalIsAddingComment : internalIsAddingComment;
  const setIsAddingComment = onSetIsAddingComment || setInternalIsAddingComment;
  
  
  const actualTitle = title || t('comments.section.titleDefault');
  const actualPlaceholder = placeholder || t('comments.section.placeholderDefault');

  const filteredComments = comments.filter(comment => 
    comment.comment_type === commentType &&
    (!stepContext || comment.step_context === stepContext)
  );

  useEffect(() => {
    if (decisionId) {
      loadComments();
    }
  }, [decisionId]);

  // Notify parent component about comments state changes
  useEffect(() => {
    if (onCommentsChange) {
      onCommentsChange(filteredComments.length > 0, isAddingComment, filteredComments.length);
    }
  }, [filteredComments.length, isAddingComment, onCommentsChange]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await commentService.getComments(decisionId);
      setComments(fetchedComments);
    } catch (error) {
      toast.error(t('comments.section.toasts.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error(t('comments.section.toasts.emptyError'));
      return;
    }

    setIsLoading(true);
    try {
      const commentData: ICommentCreate = {
        decision_id: decisionId,
        content: newComment.trim(),
        comment_type: commentType,
        step_context: stepContext
      };

      const createdComment = await commentService.createComment(commentData);
      if (createdComment) {
        // Optimisation: ajouter le commentaire au début de la liste (plus récent en haut)
        setComments(prev => [createdComment, ...prev]);
        
        // Réinitialiser l'état d'ajout AVANT de vider le texte pour éviter le flash
        setIsAddingComment(false);
        setNewComment('');
        
        toast.success(t('comments.section.toasts.addSuccess'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('comments.section.toasts.addError');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updatedComment = await commentService.updateComment(commentId, content);
      if (updatedComment) {
        setComments(prev => 
          prev.map(c => c.id === commentId ? updatedComment : c)
        );
        toast.success(t('comments.section.toasts.updateSuccess'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      toast.error(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await commentService.deleteComment(commentId);
      if (success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success(t('comments.section.toasts.deleteSuccess'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  // Fonctions pour les réactions
  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const reaction = await commentService.addReaction({ comment_id: commentId, emoji });
      if (reaction) {
        // Mettre à jour les commentaires avec la nouvelle réaction
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: [...(comment.reactions || []), reaction]
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const handleRemoveReaction = async (reactionId: string) => {
    try {
      const success = await commentService.removeReaction(reactionId);
      if (success) {
        // Mettre à jour les commentaires en retirant la réaction
        setComments(prev => prev.map(comment => ({
          ...comment,
          reactions: comment.reactions?.filter(reaction => reaction.id !== reactionId) || []
        })));
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  // Fonctions pour les réponses
  const handleAddReply = async (parentId: string, content: string) => {
    try {
      const newReply: ICommentCreate = {
        decision_id: decisionId,
        content,
        comment_type: commentType,
        step_context: stepContext,
        parent_id: parentId
      };

      const reply = await commentService.createComment(newReply);
      if (reply) {
        // Mettre à jour les commentaires avec la nouvelle réponse
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  };

  const handleUpdateReply = async (replyId: string, content: string) => {
    try {
      const updatedReply = await commentService.updateComment(replyId, content);
      if (updatedReply) {
        // Mettre à jour les commentaires avec la réponse modifiée
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies?.map(reply => 
            reply.id === replyId ? updatedReply : reply
          ) || []
        })));
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      throw error;
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const success = await commentService.deleteComment(replyId);
      if (success) {
        // Mettre à jour les commentaires en retirant la réponse
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== replyId) || []
        })));
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  };

  if (!decisionId) return null;

  return (
    <div className="space-y-4">
      {isLoading && filteredComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('comments.section.loading')}
        </div>
      ) : (
        filteredComments.length === 0 && !isAddingComment ? (
          // Empty state - centré parfaitement
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px] pt-[24px]">
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                <span>{t('comments.section.empty')}</span>
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingComment(true)}
                  className="text-black border-gray-300 hover:text-black hover:border-gray-400"
                >
                  <Plus className="h-4 w-4 mr-2 text-black" />
                  {t('comments.section.addButton')}
                </Button>
              </div>
            </div>
        ) : (
          <div className="space-y-4">

            {/* Comments list - affiché s'il y a des commentaires OU si on ajoute un commentaire */}
            {(filteredComments.length > 0 || isAddingComment) && (
              <div className="space-y-3 pt-6">
                {isAddingComment && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <MentionsInput
                        value={newComment}
                        onChange={setNewComment}
                        placeholder={actualPlaceholder}
                        className="min-h-[94px] border-0 resize-none focus:ring-0 focus:border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 pt-0 rounded-none"
                        disabled={isLoading}
                        workspaceId={currentWorkspace?.id || ''}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddComment}
                          disabled={isLoading || !newComment.trim()}
                          size="sm"
                        >
                          {t('comments.section.add')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingComment(false);
                            setNewComment('');
                          }}
                          disabled={isLoading}
                          size="sm"
                        >
                          {t('comments.section.cancel')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                
                {filteredComments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    onAddReply={handleAddReply}
                    onUpdateReply={handleUpdateReply}
                    onDeleteReply={handleDeleteReply}
                    onAddReaction={handleAddReaction}
                    onRemoveReaction={handleRemoveReaction}
                  />
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
