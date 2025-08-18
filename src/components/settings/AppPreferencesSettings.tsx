
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useI18nUI } from '@/contexts/I18nUIContext';

const AppPreferencesSettings = () => {
  const [autoSave, setAutoSave] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const { t } = useI18nUI();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('settings.preferences.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.preferences.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-save" className="font-medium">
              {t('settings.preferences.autoSave.title')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.preferences.autoSave.desc')}
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
              {t('settings.preferences.showConfidence.title')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.preferences.showConfidence.desc')}
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
