
import { useState, useEffect } from 'react';
import { User, Globe, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';
import { I18nService, SupportedLanguage } from '@/services/i18nService';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useDecisionHistory } from '@/hooks/useDecisionHistory';

const ProfileSettings = () => {
  const { user, profile, updateProfile, updateAvatar, deleteAvatar } = useAuth();
  const { toast } = useToast();
  const { t } = useI18nUI();
  const { clearHistory } = useDecisionHistory();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('fr');
  const [isUpdating, setIsUpdating] = useState(false);

  const languages = I18nService.getSupportedLanguages();

  useEffect(() => {
    setCurrentLanguage(I18nService.getCurrentLanguage());
  }, []);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ 
        full_name: fullName
      });
      
      if (error) {
        toast({
          title: "Erreur",
          description: t('profile.info.savedError'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profil mis à jour",
          description: t('profile.info.savedSuccess'),
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: t('profile.info.savedError'),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    const { error } = await updateAvatar(file);
    
    if (error) {
      throw new Error(error);
    }
  };

  const handleAvatarDelete = async () => {
    const { error } = await deleteAvatar();
    
    if (error) {
      throw new Error(error);
    }
  };


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

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: t('settings.data.toast.cleared'),
      description: t('settings.data.toast.clearedDesc'),
      variant: "destructive",
    });
  };

  const hasChanges = fullName !== (profile?.full_name || '');

  return (
    <div className="space-y-6 mb-8">
      {/* Section Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.avatar.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.avatar.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url}
            userName={profile?.full_name || user?.email || 'Utilisateur'}
            onAvatarChange={handleAvatarChange}
            onAvatarDelete={handleAvatarDelete}
            disabled={isUpdating}
          />
        </CardContent>
      </Card>


      {/* Section Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('profile.info.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.info.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{t('profile.info.email')}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fullName">{t('profile.info.fullName')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('profile.info.fullNamePlaceholder')}
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? t('profile.info.saving') : t('profile.info.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Section Langue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
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

      {/* Section Gestion des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t('settings.data.title')}
          </CardTitle>
          <CardDescription>
            {t('settings.data.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">{t('settings.data.history.title')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('settings.data.history.desc')}
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('settings.data.clearHistory')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
