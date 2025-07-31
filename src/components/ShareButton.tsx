
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

interface ShareButtonProps {
  decision: IDecision;
}

const ShareButton: React.FC<ShareButtonProps> = ({ decision }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleShareAsLink = async () => {
    setIsSharing(true);
    try {
      const publicId = await shareDecision(decision);
      const shareUrl = `${window.location.origin}/shared/${publicId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien de partage copié dans le presse-papier !");
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast.error("Erreur lors du partage");
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
            Partager
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShareAsLink}>
            <Link className="h-4 w-4 mr-2" />
            Partage simple
          </DropdownMenuItem>
          <CollaborationDialog decision={decision}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Users className="h-4 w-4 mr-2" />
              Collaborer
            </DropdownMenuItem>
          </CollaborationDialog>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShareAsTemplate}>
            <Users className="h-4 w-4 mr-2" />
            Partager comme template
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
