import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { IComment } from '@/types/comment';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { CommentItem } from './CommentItem';
import { Reply } from 'lucide-react';

interface CommentRepliesProps {
  comment: IComment;
  replies: IComment[];
  onAddReply: (content: string) => Promise<void>;
  onUpdateReply: (replyId: string, content: string) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
  isReplyFormOpen?: boolean;
  onReplyFormToggle?: (isOpen: boolean) => void;
}

export const CommentReplies: React.FC<CommentRepliesProps> = ({
  comment,
  replies,
  onAddReply,
  onUpdateReply,
  onDeleteReply,
  isReplyFormOpen = false,
  onReplyFormToggle
}) => {
  const { t } = useI18nUI();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(isReplyFormOpen);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchroniser l'état local avec la prop
  useEffect(() => {
    setShowReplyForm(isReplyFormOpen);
  }, [isReplyFormOpen]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddReply(replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      onReplyFormToggle?.(false);
      if (!showReplies) {
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReply = () => {
    setReplyContent('');
    setShowReplyForm(false);
    onReplyFormToggle?.(false);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Boutons Show replies et Reply sur la même ligne */}
      <div className="flex items-center gap-4">
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-all duration-200"
          >
            {showReplies ? (
              t('comments.item.hideReplies')
            ) : (
              `${t('comments.item.showReplies')} (${replies.length})`
            )}
          </button>
        )}
        
      </div>

      {/* Formulaire de réponse */}
      {showReplyForm && (
        <Card className="p-3">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={t('comments.item.replyPlaceholder')}
            className="min-h-[60px] mb-3"
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || isSubmitting}
            >
              {t('comments.item.addReply')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelReply}
              disabled={isSubmitting}
            >
              {t('comments.section.cancel')}
            </Button>
          </div>
        </Card>
      )}


      {/* Liste des réponses */}
      {showReplies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onUpdate={onUpdateReply}
              onDelete={onDeleteReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};
