import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { IDecision, IBreakdownItem } from '@/types/decision';
import { generateMoreOptions } from '@/services/expandOptionsService';
import { toast } from 'sonner';

interface ExpandOptionsButtonProps {
  decision: IDecision;
  currentOptions: IBreakdownItem[];
  onNewOptions: (newOptions: IBreakdownItem[]) => void;
}

const ExpandOptionsButton: React.FC<ExpandOptionsButtonProps> = ({
  decision,
  currentOptions,
  onNewOptions
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const canExpand = currentOptions.length < 10;
  const maxNewOptions = Math.min(5, 10 - currentOptions.length);

  const handleExpandOptions = async () => {
    if (!canExpand) {
      toast.error('Limite de 10 options atteinte');
      return;
    }

    setIsLoading(true);
    try {
      const newOptions = await generateMoreOptions(decision, currentOptions);
      
      if (newOptions.length === 0) {
        toast.info('Aucune nouvelle option trouvée');
        return;
      }

      onNewOptions(newOptions);
      toast.success(`${newOptions.length} nouvelle(s) option(s) ajoutée(s) !`);
    } catch (error) {
      console.error('Error expanding options:', error);
      toast.error('Erreur lors de la génération d\'options supplémentaires');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canExpand) {
    return null;
  }

  return (
    <div className="flex justify-center mt-4">
      <Button
        variant="outline"
        onClick={handleExpandOptions}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Voir plus d'options (max. {maxNewOptions})
          </>
        )}
      </Button>
    </div>
  );
};

export default ExpandOptionsButton;