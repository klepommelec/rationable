import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, ZapOff, Info } from 'lucide-react';
import { useRealTimeSearchSettings } from '@/hooks/useRealTimeSearchSettings';

export const RealTimeSearchToggle: React.FC = () => {
  const { realTimeSearchEnabled, setRealTimeSearchEnabled } = useRealTimeSearchSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {realTimeSearchEnabled ? (
            <Zap className="h-5 w-5 text-blue-500" />
          ) : (
            <ZapOff className="h-5 w-5 text-gray-400" />
          )}
          Recherche Web en Temps Réel
        </CardTitle>
        <CardDescription>
          Contrôlez l'utilisation de Perplexity pour les recherches web automatiques
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="real-time-search"
            checked={realTimeSearchEnabled}
            onCheckedChange={setRealTimeSearchEnabled}
          />
          <Label htmlFor="real-time-search">
            {realTimeSearchEnabled ? 'Activé' : 'Désactivé'}
          </Label>
        </div>
        
        {realTimeSearchEnabled ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recherche activée</strong>: L'IA peut accéder à des informations actuelles via Perplexity. 
              Cela consomme des crédits lors de la génération d'options, des liens d'achat, et des prompts tendances.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Mode hors ligne</strong>: Aucune recherche web automatique. 
              Les analyses utilisent uniquement la base de connaissances de l'IA (pas de crédits consommés).
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>La recherche web est utilisée pour :</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Générer les prompts tendances sur la page d'accueil</li>
            <li>Trouver des liens d'achat et sites officiels pour les options recommandées</li>
            <li>Obtenir des informations actuelles lors de l'analyse (si nécessaire)</li>
          </ul>
          
          <p className="text-xs mt-3">
            <strong>Optimisations automatiques :</strong> Les résultats sont mis en cache pour éviter les recherches répétées. 
            Les questions de suivi et liens sont sauvegardés pour ne pas être régénérés à chaque ouverture.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};