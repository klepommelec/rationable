import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Zap, Globe } from 'lucide-react';

interface RealTimeSearchSettingsProps {
  realTimeSearchEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const RealTimeSearchSettings: React.FC<RealTimeSearchSettingsProps> = ({
  realTimeSearchEnabled,
  onToggle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Recherche Web en Temps Réel
        </CardTitle>
        <CardDescription>
          Contrôlez l'utilisation des services de recherche externes pour économiser les crédits
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="realtime-search" className="text-base">
              Activer la recherche web
            </Label>
            <div className="text-sm text-muted-foreground">
              Permet d'obtenir des informations actuelles via Perplexity
            </div>
          </div>
          <Switch
            id="realtime-search"
            checked={realTimeSearchEnabled}
            onCheckedChange={onToggle}
          />
        </div>

        {realTimeSearchEnabled ? (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Recherche activée</strong> - L'IA peut accéder aux informations récentes 
              mais consomme des crédits Perplexity pour les questions nécessitant des données actuelles.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recherche désactivée</strong> - L'IA utilise uniquement ses connaissances 
              internes et les documents de votre workspace. Aucun crédit Perplexity ne sera consommé.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Quand la recherche web est utilisée :</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Questions sur des événements actuels ("qui a gagné aujourd'hui")</li>
            <li>Informations temporelles précises ("horaires", "prix actuels")</li>
            <li>Données récentes avec années spécifiques</li>
          </ul>
          
          <p className="mt-3 mb-2">
            <strong>Optimisations automatiques :</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Cache intelligent avec TTL adaptatif</li>
            <li>Déduplication des requêtes simultanées</li>
            <li>Détection stricte du besoin de données temps réel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};