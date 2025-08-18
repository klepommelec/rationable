
import { useTheme } from 'next-themes';
import { Lightbulb, LightbulbOff, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useI18nUI } from '@/contexts/I18nUIContext';

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18nUI();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          {t('settings.appearance.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.appearance.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base font-medium">{t('settings.appearance.themeLabel')}</Label>
          <div className="flex gap-2 mt-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {t('settings.appearance.light')}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              <LightbulbOff className="h-4 w-4 mr-2" />
              {t('settings.appearance.dark')}
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              {t('settings.appearance.system')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
