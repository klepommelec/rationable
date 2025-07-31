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

interface CollaborationDialogProps {
  decision: IDecision;
  children: React.ReactNode;
}

const CollaborationDialog: React.FC<CollaborationDialogProps> = ({
  decision,
  children
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreatePublicLink = async () => {
    if (shareUrl) return; // Déjà créé
    
    setIsSharing(true);
    try {
      const publicId = await shareDecision(decision);
      const url = `${window.location.origin}/shared/${publicId}`;
      setShareUrl(url);
      toast.success("Lien de partage créé !");
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast.error("Erreur lors de la création du lien");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleSendInvitation = () => {
    if (!emailInput.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }
    
    if (!shareUrl) {
      toast.error("Créez d'abord un lien de partage");
      return;
    }

    // Ouvrir le client email avec le lien pré-rempli
    const subject = encodeURIComponent(`Invitation à consulter: ${decision.dilemma}`);
    const body = encodeURIComponent(
      `Salut !\n\nJe souhaite partager avec toi mon analyse de décision : "${decision.dilemma}"\n\nTu peux la consulter ici : ${shareUrl}\n\nN'hésite pas à laisser tes commentaires !\n\nBonne journée !`
    );
    
    window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
    toast.success("Client email ouvert !");
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
            Collaborer sur cette décision
          </DialogTitle>
          <DialogDescription>
            Partagez votre analyse et invitez d'autres personnes à commenter.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Lien public
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Inviter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4">
            <div className="space-y-2">
              <Label>Lien de partage public</Label>
              <p className="text-sm text-muted-foreground">
                Créez un lien que vous pouvez partager avec n'importe qui.
              </p>
            </div>
            
            {!shareUrl ? (
              <Button 
                onClick={handleCreatePublicLink} 
                disabled={isSharing}
                className="w-full"
              >
                {isSharing ? "Création..." : "Créer un lien public"}
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
                  ✓ Lien créé ! Partagez-le avec qui vous voulez.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Inviter par email</Label>
              <p className="text-sm text-muted-foreground">
                Envoyez une invitation personnalisée par email.
              </p>
            </div>
            
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button 
                onClick={handleSendInvitation}
                className="w-full"
                disabled={!shareUrl}
              >
                Envoyer l'invitation
              </Button>
              {!shareUrl && (
                <p className="text-sm text-amber-600">
                  ⚠️ Créez d'abord un lien public dans l'onglet précédent.
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