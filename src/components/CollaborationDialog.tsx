import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail } from "lucide-react";
import { IDecision } from '@/types/decision';
import { shareDecision } from '@/services/sharedDecisionService';
import { toast } from "sonner";
import { useI18nUI } from '@/contexts/I18nUIContext';
import { APP_CONFIG } from '@/lib/config';

interface CollaborationDialogProps {
  decision: IDecision;
  children: React.ReactNode;
}

const CollaborationDialog: React.FC<CollaborationDialogProps> = ({
  decision,
  children
}) => {
  const { t } = useI18nUI();
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [emailInput, setEmailInput] = useState('');

  const ensureShareUrl = async () => {
    if (shareUrl) return shareUrl;
    
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
      
      const url = `${APP_CONFIG.getShareDomain()}/shared/${titleSlug}-${publicId}`;
      setShareUrl(url);
      return url;
    } catch (error) {
      console.error('Error sharing decision:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!emailInput.trim()) {
      toast.error(t('collaboration.emailRequired'));
      return;
    }

    try {
      const url = await ensureShareUrl();
      
      // Open email client with pre-filled link
      const subject = encodeURIComponent(`Invitation à consulter: ${decision.dilemma}`);
      const body = encodeURIComponent(
        `Salut !\n\nJe souhaite partager avec toi mon analyse de décision : "${decision.dilemma}"\n\nTu peux la consulter ici : ${url}\n\nN'hésite pas à laisser tes commentaires !\n\nBonne journée !`
      );
      
      window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
      toast.success(t('collaboration.emailClientOpened'));
      setEmailInput('');
    } catch (error) {
      toast.error('Erreur lors de la création du lien de partage');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('collaboration.title')}
          </DialogTitle>
          <DialogDescription>
            {t('collaboration.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('collaboration.inviteByEmail')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('collaboration.inviteDescription')}
            </p>
          </div>
          
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder={t('collaboration.emailPlaceholder')}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
            <Button 
              onClick={handleSendInvitation}
              className="w-full"
              disabled={isSharing || !emailInput.trim()}
            >
              {isSharing ? 'Préparation...' : t('collaboration.sendInvitation')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationDialog;