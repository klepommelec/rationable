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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Link as LinkIcon, Mail, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const handleCreatePublicLink = async () => {
    if (shareUrl) return; // Already created
    
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
      toast.success(t('collaboration.linkCreatedToast'));
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast.error(t('collaboration.linkCreateError'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('collaboration.linkCopiedToast'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('collaboration.linkCopyError'));
    }
  };

  const handleSendInvitation = () => {
    if (!emailInput.trim()) {
      toast.error(t('collaboration.emailRequired'));
      return;
    }
    
    if (!shareUrl) {
      toast.error(t('collaboration.createLinkFirstError'));
      return;
    }

    // Open email client with pre-filled link
    const subject = encodeURIComponent(`Invitation à consulter: ${decision.dilemma}`);
    const body = encodeURIComponent(
      `Salut !\n\nJe souhaite partager avec toi mon analyse de décision : "${decision.dilemma}"\n\nTu peux la consulter ici : ${shareUrl}\n\nN'hésite pas à laisser tes commentaires !\n\nBonne journée !`
    );
    
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
    toast.success(t('collaboration.emailClientOpened'));
    setEmailInput('');
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

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              {t('collaboration.publicLink')}
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('collaboration.invite')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4">
            <div className="space-y-2">
              <Label>{t('collaboration.publicLink')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('collaboration.publicLinkDescription')}
              </p>
            </div>
            
            {!shareUrl ? (
              <Button 
                onClick={handleCreatePublicLink} 
                disabled={isSharing}
                className="w-full"
              >
                {isSharing ? t('collaboration.creating') : t('collaboration.createLink')}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input 
                    value={shareUrl} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-green-600">
                  {t('collaboration.linkSuccess')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('collaboration.inviteByEmail')}</Label>
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
                disabled={!shareUrl}
              >
                {t('collaboration.sendInvitation')}
              </Button>
              {!shareUrl && (
                <p className="text-sm text-amber-600">
                  {t('collaboration.createLinkFirst')}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationDialog;