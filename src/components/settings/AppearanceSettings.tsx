
import { useTheme } from 'next-themes';
import { Lightbulb, LightbulbOff, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
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
  );
};

export default AppearanceSettings;
