
import { Database, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const DataManagementSettings = () => {
  const { toast } = useToast();

  const handleClearHistory = () => {
    toast({
      title: "Historique vidé",
      description: "Toutes vos décisions ont été supprimées.",
      variant: "destructive",
    });
  };

  return (
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
  );
};

export default DataManagementSettings;
