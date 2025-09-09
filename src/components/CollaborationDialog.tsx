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
import { supabase } from '@/integrations/supabase/client';

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
  const [isSending, setIsSending] = useState(false);
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

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendInvitation = async () => {
    const email = emailInput.trim();
    
    if (!email) {
      toast.error(t('collaboration.emailRequired'));
      return;
    }

    if (!isValidEmail(email)) {
      toast.error(t('collaboration.invalidEmail'));
      return;
    }

    setIsSending(true);
    try {
      const url = await ensureShareUrl();
      
      const { error } = await supabase.functions.invoke('send-collaboration-invite', {
        body: {
          to: email,
          shareUrl: url,
          decisionTitle: decision.dilemma,
          inviterName: '', // Could be retrieved from user profile if available
          inviterEmail: '', // Could be retrieved from user profile if available
          locale: 'fr', // Could use t('i18n.locale') or detect from context
        },
      });

      if (error) {
        console.error('Error sending invitation:', error);
        const errorMessage = error.message || 'Unknown error occurred';
        toast.error(`Erreur d'envoi: ${errorMessage}`);
        return;
      }

      toast.success(t('collaboration.invitationSent'));
      setEmailInput('');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.message || error.error?.message || 'Unknown error occurred';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsSending(false);
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
              disabled={isSharing || isSending || !emailInput.trim() || !isValidEmail(emailInput.trim())}
            >
              {isSending ? 'Envoi en cours...' : isSharing ? 'Préparation...' : t('collaboration.sendInvitation')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationDialog;