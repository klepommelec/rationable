
import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useDecisionHistory } from '@/hooks/useDecisionHistory';

const ProfileSettings = () => {
  const { user, profile, updateProfile, updateAvatar, deleteAvatar } = useAuth();
  const { toast } = useToast();
  const { t } = useI18nUI();
  const { clearHistory } = useDecisionHistory();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchroniser fullName avec profile?.full_name quand le profile change
  useEffect(() => {
    if (profile?.full_name !== undefined) {
      setFullName(profile.full_name || '');
    }
  }, [profile?.full_name]);

  const saveProfile = useCallback(async (name: string) => {
    if (name === (profile?.full_name || '')) return; // Pas de changement
    
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ 
        full_name: name
      });
      
      if (error) {
        toast({
          title: t('common.error'),
          description: t('profile.info.savedError'),
          variant: "destructive",
        });
      } else {
        setHasUnsavedChanges(false);
        // Toast discret pour la sauvegarde automatique
        toast({
          title: t('profile.info.savedSuccess'),
          description: "",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.info.savedError'),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }, [profile?.full_name, updateProfile, toast, t]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    const hasChanges = fullName !== (profile?.full_name || '');
    setHasUnsavedChanges(hasChanges);
    
    if (!hasChanges) return;
    
    const timeoutId = setTimeout(() => {
      saveProfile(fullName);
    }, 1000); // Debounce de 1 seconde
    
    return () => clearTimeout(timeoutId);
  }, [fullName, profile?.full_name, saveProfile]);

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



  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: t('settings.data.toast.cleared'),
      description: t('settings.data.toast.clearedDesc'),
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Section Avatar */}
      <Card>
        <CardHeader>
        <CardTitle>
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
        <CardTitle>
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
                disabled={isUpdating}
              />
              {hasUnsavedChanges && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('profile.info.saving')}...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Gestion des données */}
      <Card>
        <CardHeader>
        <CardTitle>
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
