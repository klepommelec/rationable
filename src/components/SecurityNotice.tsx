import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SecurityNotice = () => {
  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-800 dark:text-green-200">
        <div className="space-y-3">
          <p className="font-medium">✅ Sécurité renforcée - Corrections appliquées</p>
          <p className="text-sm">
            Les vulnérabilités critiques ont été corrigées. Il reste deux recommandations de configuration :
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>Réduire la durée d'expiration des codes OTP (de 24h à 5-10 minutes)</li>
            <li>Activer la protection contre les mots de passe compromis</li>
          </ul>
          <div className="flex gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard/project/dzrlrfkidaahceryoajc/auth/providers', '_blank')}
            >
              Paramètres OTP
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection', '_blank')}
            >
              Protection des mots de passe
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};