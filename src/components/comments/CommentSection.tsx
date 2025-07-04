
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Plus } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { commentService } from '@/services/commentService';
import { IComment, ICommentCreate } from '@/types/comment';
import { toast } from 'sonner';

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
  title = "Commentaires",
  placeholder = "Partagez votre commentaire, note ou réflexion..."
}) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

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
      toast.error("Erreur lors du chargement des commentaires");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
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
        toast.success("Commentaire ajouté");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    const updatedComment = await commentService.updateComment(commentId, content);
    if (updatedComment) {
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await commentService.deleteComment(commentId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  if (!decisionId) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {isLoading && filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement des commentaires...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <span>Aucun commentaire pour le moment</span>
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
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[80px] border-none px-[4px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddComment}
                disabled={isLoading || !newComment.trim()}
                size="sm"
              >
                Ajouter
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
                Annuler
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingComment(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un commentaire
          </Button>
        )}
      </div>
    </div>
  );
};
