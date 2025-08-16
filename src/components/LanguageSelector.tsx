import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { I18nService, SupportedLanguage } from '@/services/i18nService';
import { useState, useEffect } from 'react';

export const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');
  const languages = I18nService.getSupportedLanguages();

  useEffect(() => {
    setCurrentLanguage(I18nService.getCurrentLanguage());
  }, []);

  const handleLanguageChange = (language: SupportedLanguage) => {
    I18nService.setLanguage(language);
    setCurrentLanguage(language);
    // Reload to apply language changes throughout the app
    window.location.reload();
  };

  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.name || 'Français';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguageName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLanguage === language.code ? 'bg-accent' : ''}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};