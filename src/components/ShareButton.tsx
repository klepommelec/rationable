
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Share2, Link, Users, Loader2 } from "lucide-react";
import { IDecision } from '@/types/decision';
import { shareDecision } from '@/services/sharedDecisionService';
import { toast } from "sonner";
import ShareAsTemplateDialog from './ShareAsTemplateDialog';
import CollaborationDialog from './CollaborationDialog';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface ShareButtonProps {
  decision: IDecision;
}

const ShareButton: React.FC<ShareButtonProps> = ({ decision }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const { t } = useI18nUI();

  const handleShareAsLink = async () => {
    setIsSharing(true);
    try {
      const publicId = await shareDecision(decision);
      // Create SEO-friendly URL with title slug
      const titleSlug = decision.dilemma.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 50) // Limit length
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      const shareUrl = `${window.location.origin}/shared/${titleSlug}-${publicId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('share.toasts.linkCopied'));
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast.error(t('share.toasts.shareError'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareAsTemplate = () => {
    setTemplateDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isSharing}>
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {t('share.button.share')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShareAsLink}>
            <Link className="h-4 w-4 mr-2" />
            {t('share.button.simpleShare')}
          </DropdownMenuItem>
          <CollaborationDialog decision={decision}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Users className="h-4 w-4 mr-2" />
              {t('share.button.collaborate')}
            </DropdownMenuItem>
          </CollaborationDialog>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShareAsTemplate}>
            <Users className="h-4 w-4 mr-2" />
            {t('share.button.shareAsTemplate')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareAsTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        decision={decision}
      />
    </>
  );
};

export default ShareButton;
