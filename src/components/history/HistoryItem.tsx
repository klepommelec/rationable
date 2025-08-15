
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from 'lucide-react';
import { IDecision } from '@/types/decision';
import { CategoryBadge } from '../CategorySelector';

interface HistoryItemProps {
  decision: IDecision;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  loadId?: string;
  followUpCount?: number;
  titleOverride?: string;
  rootRecommendation?: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  decision,
  onLoad,
  onDelete,
  loadId,
  followUpCount,
  titleOverride,
  rootRecommendation
}) => {
  const handleLoad = () => {
    console.log('Loading decision:', decision.id);
    onLoad(decision.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le déclenchement du clic sur la carte
    console.log('Deleting decision:', decision.id);
    onDelete(decision.id);
  };

  return (
    <TooltipProvider>
      <div 
        className="p-3 rounded-lg bg-card border cursor-pointer hover:bg-accent/50 transition-colors relative"
        onClick={handleLoad}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Titre principal avec emoji */}
            <div className="mb-1">
              <div className="sm:hidden space-y-1">
                <span className="text-lg block">{decision.emoji}</span>
                <p className="font-semibold text-foreground">{titleOverride || decision.dilemma}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-lg">{decision.emoji}</span>
                <p className="font-semibold text-foreground truncate flex-1">{titleOverride || decision.dilemma}</p>
              </div>
            </div>
            
            {/* Catégorie */}
            {decision.category && decision.category !== 'other' && decision.category !== 'Autre' && (
              <div>
                <CategoryBadge categoryId={decision.category} />
              </div>
            )}
            
            {/* Réponse principale */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {rootRecommendation || decision.result.recommendation}
            </p>
            
            {/* Questions de suivi */}
            {typeof followUpCount === 'number' && followUpCount > 0 && (
              <p className="text-xs text-muted-foreground">
                + {followUpCount} question{followUpCount > 1 ? 's' : ''} de suivi
              </p>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete} 
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Date en bas à droite avec tooltip */}
        <div className="absolute bottom-2 right-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-muted-foreground cursor-help">
                {new Date(decision.timestamp).toLocaleDateString('fr-FR')}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{new Date(decision.timestamp).toLocaleString('fr-FR')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
