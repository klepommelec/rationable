
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
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
  );
};

export default NotificationSettings;
