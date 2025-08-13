import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SecurityNotice = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <div className="space-y-3">
          <p className="font-medium">Configuration de sécurité recommandée</p>
          <p className="text-sm">
            Pour une sécurité optimale, veuillez configurer ces paramètres dans votre tableau de bord Supabase :
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>Réduire la durée d'expiration des codes OTP</li>
            <li>Activer la protection contre les mots de passe compromis</li>
          </ul>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => window.open('https://supabase.com/dashboard/project/dzrlrfkidaahceryoajc/auth/providers', '_blank')}
          >
            Ouvrir les paramètres d'authentification
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};