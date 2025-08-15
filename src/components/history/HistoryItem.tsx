
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Share2, Trash2 } from 'lucide-react';
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
    e.stopPropagation();
    console.log('Deleting decision:', decision.id);
    onDelete(decision.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Sharing decision:', decision.id);
    // TODO: Implement share functionality
  };

  return (
    <TooltipProvider>
      <div 
        className="p-4 rounded-lg bg-card border cursor-pointer hover:bg-accent/50 transition-colors relative"
        onClick={handleLoad}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Titre principal avec emoji et questions de suivi */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{decision.emoji}</span>
              <p className="font-semibold text-foreground flex-1 min-w-0 truncate">
                {titleOverride || decision.dilemma}
              </p>
              {typeof followUpCount === 'number' && followUpCount > 0 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                  + {followUpCount} question{followUpCount > 1 ? 's' : ''} de suivi
                </span>
              )}
            </div>
            
            {/* Réponse principale */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {rootRecommendation || decision.result.recommendation}
            </p>
            
            {/* Date avec plus d'espace au-dessus */}
            <div className="pt-2">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
};
