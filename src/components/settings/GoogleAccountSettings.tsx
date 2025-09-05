import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link, Unlink } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useToast } from '@/hooks/use-toast';

const GoogleAccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const { user, linkWithGoogle } = useAuth();
  const { t } = useI18nUI();
  const { toast } = useToast();

  // Check if user has Google identity linked
  const hasGoogleLinked = user?.identities?.some(identity => identity.provider === 'google') ?? false;

  const handleLinkGoogle = async () => {
    setLoading(true);
    
    const { error } = await linkWithGoogle();
    
    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Compte Google connecté avec succès"
      });
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Compte Google
        </CardTitle>
        <CardDescription>
          Connectez votre compte Google pour une connexion plus rapide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasGoogleLinked ? (
          <Alert>
            <Unlink className="h-4 w-4" />
            <AlertDescription>
              Votre compte Google est connecté. Vous pouvez maintenant vous connecter avec Google.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Vous pouvez lier votre compte Google pour vous connecter plus facilement à l'avenir.
            </p>
            <Button 
              onClick={handleLinkGoogle}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.actions.linkGoogle')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAccountSettings;