
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Lightbulb, LightbulbOff, Monitor, User, Bell, Shield, Database, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);

  const handleSaveProfile = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  const handleClearHistory = () => {
    toast({
      title: "Historique vidé",
      description: "Toutes vos décisions ont été supprimées.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>

      {/* Thème */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Thème</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Clair
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <LightbulbOff className="h-4 w-4 mr-2" />
                Sombre
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Système
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profil */}
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

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Gérez vos préférences de notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Notifications par email
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevez des emails pour les nouvelles fonctionnalités
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="font-medium">
                Notifications push
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications dans le navigateur
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Préférences de l'application */}
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

      {/* Données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des données
          </CardTitle>
          <CardDescription>
            Gérez vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Historique des décisions</Label>
              <p className="text-sm text-muted-foreground">
                Supprime toutes vos décisions sauvegardées
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Vider l'historique
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
