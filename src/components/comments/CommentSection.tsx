import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { commentService } from '@/services/commentService';
import { IComment, ICommentCreate } from '@/types/comment';
import { toast } from 'sonner';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface CommentSectionProps {
  decisionId: string;
  commentType: 'general' | 'criteria' | 'option' | 'recommendation';
  stepContext?: string;
  title?: string;
  placeholder?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  decisionId,
  commentType,
  stepContext,
  title,
  placeholder
}) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { t } = useI18nUI();
  
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
        setComments(prev => [...prev, createdComment]);
        setNewComment('');
        setIsAddingComment(false);
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
        toast.success("Commentaire mis à jour");
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
        toast.success("Commentaire supprimé");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  if (!decisionId) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {isLoading && filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('comments.section.loading')}
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <span>{t('comments.section.empty')}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}

        {isAddingComment ? (
          <Card className="p-4 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={actualPlaceholder}
              className="min-h-[80px]"
              disabled={isLoading}
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
          </Card>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingComment(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('comments.section.addButton')}
          </Button>
        )}
      </div>
    </div>
  );
};
