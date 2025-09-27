
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Plus } from 'lucide-react';

interface ManualOptionsGeneratorProps {
  onGenerateOptions: () => void;
  onAddManualOption?: () => void;
  isLoading: boolean;
  hasChanges: boolean;
}

const ManualOptionsGenerator: React.FC<ManualOptionsGeneratorProps> = ({
  onGenerateOptions,
  onAddManualOption,
  isLoading,
  hasChanges
}) => {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Génération d'options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {hasChanges 
            ? "Vous avez modifié les critères. Générez de nouvelles options pour voir l'impact de vos changements."
            : "Cliquez pour générer les options basées sur vos critères actuels."
          }
        </p>
        <div className="flex gap-2">
          {onAddManualOption && (
            <Button 
              onClick={onAddManualOption}
              variant="outline"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une option
            </Button>
          )}
          
          <Button 
            onClick={onGenerateOptions}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {hasChanges ? "Mettre à jour les options" : "Générer les options"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualOptionsGenerator;
