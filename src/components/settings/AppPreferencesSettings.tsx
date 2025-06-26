
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const AppPreferencesSettings = () => {
  const [autoSave, setAutoSave] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Préférences de l'application
        </CardTitle>
        <CardDescription>
          Configurez le comportement de l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-save" className="font-medium">
              Sauvegarde automatique
            </Label>
            <p className="text-sm text-muted-foreground">
              Sauvegarde automatique de vos décisions
            </p>
          </div>
          <Switch
            id="auto-save"
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-confidence" className="font-medium">
              Afficher le niveau de confiance
            </Label>
            <p className="text-sm text-muted-foreground">
              Affiche l'indicateur de confiance de l'IA
            </p>
          </div>
          <Switch
            id="show-confidence"
            checked={showConfidence}
            onCheckedChange={setShowConfidence}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferencesSettings;
