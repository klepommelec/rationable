
import { useState } from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';

const ProfileSettings = () => {
  const { user, profile, updateProfile, updateAvatar, deleteAvatar } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ full_name: fullName });
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour du profil.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profil mis à jour",
          description: "Vos modifications ont été enregistrées avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
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

  return (
    <div className="space-y-6">
      {/* Section Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Photo de profil
          </CardTitle>
          <CardDescription>
            Téléchargez une photo de profil pour personnaliser votre compte
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
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Informations de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={isUpdating || fullName === (profile?.full_name || '')}
          >
            {isUpdating ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
