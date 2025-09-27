
import { useTheme } from 'next-themes';
import { Lightbulb, LightbulbOff, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { I18nService, SupportedLanguage } from '@/services/i18nService';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18nUI();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');

  const languages = I18nService.getSupportedLanguages();

  useEffect(() => {
    setCurrentLanguage(I18nService.getCurrentLanguage());
  }, []);

  const handleLanguageChange = (language: SupportedLanguage) => {
    I18nService.setLanguage(language);
    setCurrentLanguage(language);
    toast({
      title: t('profile.language.toastTitle'),
      description: t('profile.language.toastDesc'),
    });
    // Rechargement pour appliquer la langue partout
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Section Apparence */}
      <Card>
        <CardHeader>
          <CardTitle>
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

      {/* Section Langue */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('profile.language.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.language.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">{t('profile.language.label')}</Label>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder={t('profile.language.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('profile.language.helpText')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
