
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { IComment } from '@/types/comment';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: IComment;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
      toast.success("Commentaire mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
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
      toast.success("Commentaire supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'criteria': return 'Critère';
      case 'option': return 'Option';
      case 'recommendation': return 'Recommandation';
      default: return 'Général';
    }
  };

  return (
    <Card className="p-4 space-y-3 bg-card border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {getTypeLabel(comment.comment_type)}
          </span>
          {comment.step_context && (
            <span className="text-xs text-muted-foreground">
              • {comment.step_context}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
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
          placeholder="Ajoutez votre commentaire..."
          className="min-h-[80px] bg-card text-card-foreground border-input"
          disabled={isLoading}
        />
      ) : (
        <p className="text-sm text-card-foreground whitespace-pre-wrap">
          {comment.content}
        </p>
      )}

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Créé le {formatDate(comment.created_at)}</span>
        {comment.updated_at !== comment.created_at && (
          <span>Modifié le {formatDate(comment.updated_at)}</span>
        )}
      </div>
    </Card>
  );
};
