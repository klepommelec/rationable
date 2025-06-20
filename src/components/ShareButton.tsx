
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { IDecision } from '@/types/decision';
import { shareDecision } from '@/services/sharedDecisionService';

interface ShareButtonProps {
  decision: IDecision;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ decision, className }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (shareUrl) return; // Already shared
    
    setIsSharing(true);
    try {
      const publicId = await shareDecision(decision);
      const url = `${window.location.origin}/shared/${publicId}`;
      setShareUrl(url);
      toast.success('Lien de partage créé !');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors du partage');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setTimeout(() => {
        setShareUrl(null);
        setCopied(false);
      }, 200);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager cette décision</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Créez un lien public pour partager cette analyse de décision. 
            N'importe qui pourra la consulter sans avoir besoin de compte.
          </p>
          
          {!shareUrl ? (
            <Button 
              onClick={handleShare} 
              disabled={isSharing}
              className="w-full"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création du lien...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Créer le lien de partage
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                ✅ Lien créé ! Ce lien expire dans 30 jours.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;
