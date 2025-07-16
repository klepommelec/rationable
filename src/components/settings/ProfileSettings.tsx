
import { useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AvatarUpload from '@/components/AvatarUpload';

const ProfileSettings = () => {
  const { user, profile, updateProfile, updateAvatar, deleteAvatar } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [useContext, setUseContext] = useState(profile?.use_context || 'personal');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ 
        full_name: fullName,
        use_context: useContext as 'personal' | 'professional'
      });
      
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

  const hasChanges = fullName !== (profile?.full_name || '') || useContext !== (profile?.use_context || 'personal');

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

      {/* Section Contexte d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Contexte d'utilisation
          </CardTitle>
          <CardDescription>
            Choisissez votre contexte principal pour personnaliser votre expérience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="context">Comment utilisez-vous principalement cette application ?</Label>
            <RadioGroup
              value={useContext}
              onValueChange={setUseContext}
              className="grid grid-cols-1 gap-4"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                <RadioGroupItem value="personal" id="personal" />
                <div className="flex-1">
                  <Label htmlFor="personal" className="font-medium cursor-pointer">
                    Usage personnel
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Décisions personnelles, choix de vie, achats, loisirs
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50">
                <RadioGroupItem value="professional" id="professional" />
                <div className="flex-1">
                  <Label htmlFor="professional" className="font-medium cursor-pointer">
                    Usage professionnel
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Décisions business, stratégie, management, projets
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
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
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
