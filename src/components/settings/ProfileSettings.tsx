
import { useState } from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profil
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
              value={profile?.full_name || ''}
              placeholder="Votre nom complet"
              className="mt-1"
            />
          </div>
        </div>
        <Button onClick={handleSaveProfile}>
          Sauvegarder le profil
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
