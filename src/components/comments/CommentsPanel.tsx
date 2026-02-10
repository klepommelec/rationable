import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { MentionsInput } from './MentionsInput';
import { commentService } from '@/services/commentService';
import { IComment, ICommentCreate } from '@/types/comment';
import { toast } from 'sonner';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useWorkspacesContext } from '@/contexts/WorkspacesContext';

export interface CommentsSummary {
  count: number;
  lastCommenters: IComment[];
}

interface CommentsPanelProps {
  decisionId: string | null | undefined;
  commentsCount?: number;
  onCommentsCountChange?: (count: number) => void;
  /** Contrôle externe du panneau (pour ouvrir depuis le bloc Comments dans le résultat). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Appelé quand les commentaires sont chargés/mis à jour (pour afficher le résumé dans le bloc). */
  onCommentsDataChange?: (data: CommentsSummary) => void;
  /** 'sheet' = panneau latéral droit (défaut), 'inline' = contenu affiché en bas de page. */
  variant?: 'sheet' | 'inline';
  /** ID du conteneur DOM où rendre le contenu en bas de page quand variant='inline'. */
  inlineTargetId?: string;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  decisionId,
  commentsCount: externalCommentsCount,
  onCommentsCountChange,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCommentsDataChange,
  variant = 'sheet',
  inlineTargetId = 'comments-inline-root',
}) => {
  const { t } = useI18nUI();
  const { currentWorkspace } = useWorkspacesContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = useCallback(async (showLoading = true) => {
    if (!decisionId) return;
    
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const fetchedComments = await commentService.getComments(decisionId);
      setComments(fetchedComments);
      // Notifier le parent du nombre de commentaires
      if (onCommentsCountChange) {
        onCommentsCountChange(fetchedComments.length);
      }
    } catch (error) {
      toast.error(t('comments.section.toasts.loadError'));
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [decisionId, onCommentsCountChange, t]);

  // Charger commentaires et compteur au montage (pour afficher les avatars sur le bouton sans ouvrir le panel)
  useEffect(() => {
    if (!decisionId) return;
    
    const loadCountAndComments = async () => {
      try {
        const fetchedComments = await commentService.getComments(decisionId);
        setComments(fetchedComments);
        if (onCommentsCountChange) {
          onCommentsCountChange(fetchedComments.length);
        }
      } catch (error) {
        console.error('Error loading comments count:', error);
      }
    };
    
    loadCountAndComments();
  }, [decisionId, onCommentsCountChange]);

  // Charger les commentaires complets quand le panel est ouvert
  useEffect(() => {
    if (decisionId && isOpen) {
      // Chargement initial avec loading
      loadComments(true);
      // Recharger périodiquement quand le panel est ouvert (sans afficher le loading pour éviter le flash)
      const interval = setInterval(() => {
        loadComments(false);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [decisionId, isOpen, loadComments]);

  // En mode inline, scroller vers la zone commentaires à l'ouverture
  useEffect(() => {
    if (variant === 'inline' && isOpen && typeof document !== 'undefined') {
      const target = document.getElementById(inlineTargetId);
      if (target) {
        const timer = requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        return () => cancelAnimationFrame(timer);
      }
    }
  }, [variant, isOpen, inlineTargetId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !decisionId) {
      toast.error(t('comments.section.toasts.emptyError'));
      return;
    }

    setIsLoading(true);
    try {
      const commentData: ICommentCreate = {
        decision_id: decisionId,
        content: newComment.trim(),
        comment_type: 'general'
      };

      const createdComment = await commentService.createComment(commentData);
      if (createdComment) {
        // Ajouter le commentaire au début de la liste (plus récent en haut)
        setComments(prev => [createdComment, ...prev]);
        setNewComment('');
        toast.success(t('comments.section.toasts.addSuccess'));
        
        // Mettre à jour le compteur
        if (onCommentsCountChange) {
          onCommentsCountChange(comments.length + 1);
        }
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
        
        // Mettre à jour le compteur
        if (onCommentsCountChange) {
          onCommentsCountChange(comments.length - 1);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const reaction = await commentService.addReaction({ comment_id: commentId, emoji });
      if (reaction) {
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

  const handleAddReply = async (parentId: string, content: string) => {
    if (!decisionId) return;
    
    try {
      const newReply: ICommentCreate = {
        decision_id: decisionId,
        content,
        comment_type: 'general',
        parent_id: parentId
      };

      const reply = await commentService.createComment(newReply);
      if (reply) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          }
          return comment;
        }));
        toast.success(t('comments.section.toasts.addSuccess'));
        
        // Mettre à jour le compteur
        if (onCommentsCountChange) {
          onCommentsCountChange(comments.length + 1);
        }
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
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies?.map(reply => 
            reply.id === replyId ? updatedReply : reply
          ) || []
        })));
        toast.success(t('comments.section.toasts.updateSuccess'));
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
        setComments(prev => prev.map(comment => ({
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== replyId) || []
        })));
        toast.success(t('comments.section.toasts.deleteSuccess'));
        
        // Mettre à jour le compteur
        if (onCommentsCountChange) {
          onCommentsCountChange(comments.length - 1);
        }
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  };

  // Filtrer uniquement les commentaires principaux (sans parent_id)
  const mainComments = comments.filter(comment => !comment.parent_id);

  const displayCount = externalCommentsCount !== undefined ? externalCommentsCount : comments.length;

  // Derniers 3 auteurs distincts (tous commentaires + réponses, triés par date décroissante)
  const lastThreeCommenters = useMemo(() => {
    const byDate = [...comments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const seen = new Set<string>();
    return byDate.filter(c => {
      if (seen.has(c.user_id)) return false;
      seen.add(c.user_id);
      return true;
    }).slice(0, 3);
  }, [comments]);

  useEffect(() => {
    if (onCommentsDataChange && decisionId) {
      const count = externalCommentsCount !== undefined ? externalCommentsCount : comments.length;
      onCommentsDataChange({ count, lastCommenters: lastThreeCommenters });
    }
  }, [comments, externalCommentsCount, lastThreeCommenters, decisionId, onCommentsDataChange]);

  const commentsInputBlock = (
    <div className={variant === 'inline' ? 'pt-6 pb-4' : 'border-t p-4 bg-background'}>
      <div className="relative rounded-none border border-border bg-background">
        <MentionsInput
          value={newComment}
          onChange={setNewComment}
          placeholder={t('comments.section.placeholderDefault')}
          className="min-h-[94px] resize-none border-0 rounded-none shadow-none pb-12 pr-2"
          disabled={isLoading}
          workspaceId={currentWorkspace?.id || ''}
        />
        <Button
          onClick={handleAddComment}
          disabled={isLoading || !newComment.trim()}
          size="sm"
          className="absolute bottom-2 right-2"
        >
          {t('comments.section.add')}
        </Button>
      </div>
    </div>
  );

  const commentsListBlock = (
    <div className="flex-1 overflow-y-auto flex flex-col border border-border">
      {isLoading && mainComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('comments.section.loading')}
        </div>
      ) : mainComments.length === 0 ? (
        <div className="text-center text-muted-foreground flex flex-col items-center justify-center min-h-[120px]">
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            <span>{t('comments.section.empty')}</span>
          </div>
        </div>
      ) : (
        mainComments.map(comment => (
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
        ))
      )}
    </div>
  );

  /** Contenu pour le Sheet (panneau droit) : liste puis input en bas */
  const commentsContent = (
    <>
      {commentsListBlock}
      {commentsInputBlock}
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      className="flex items-center gap-2 h-9 px-3 py-1"
      {...(variant === 'inline' ? { onClick: () => setIsOpen(!isOpen) } : {})}
    >
      {displayCount > 0 && lastThreeCommenters.length > 0 && (
        <div className="flex -space-x-2">
          {lastThreeCommenters.map((comment) => (
            <Avatar key={comment.user_id} className="h-5 w-5 border-2 border-background">
              <AvatarImage
                src={comment.user?.user_metadata?.avatar_url || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-[10px] bg-muted">
                {comment.user?.user_metadata?.full_name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
      {displayCount > 0 ? (
        <>
          <span className="font-medium">{t('comments.section.titleDefault')}</span>
          <span className="text-sm font-medium text-muted-foreground">({displayCount})</span>
        </>
      ) : (
        <>
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="font-medium">{t('comments.section.addButton')}</span>
        </>
      )}
    </Button>
  );

  if (!decisionId) {
    return null;
  }

  if (variant === 'inline') {
    const targetEl = typeof document !== 'undefined' ? document.getElementById(inlineTargetId) : null;
    return (
      <>
        {triggerButton}
        {isOpen && targetEl &&
          createPortal(
            <>
              {/* Dans la continuité du body : input puis commentaires, sans conteneur */}
              {commentsInputBlock}
              {commentsListBlock}
            </>,
            targetEl
          )}
      </>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {triggerButton}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>
            Comments {displayCount > 0 && `(${displayCount})`}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {commentsContent}
        </div>
      </SheetContent>
    </Sheet>
  );
};

