
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreHorizontal, Share2, Trash2, Loader2 } from 'lucide-react';
import { IDecision } from '@/types/decision';
import { CategoryBadge } from '../CategorySelector';
import { shareDecision } from '@/services/sharedDecisionService';
import { toast } from "sonner";

interface HistoryItemProps {
  decision: IDecision;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  loadId?: string;
  followUpCount?: number;
  followUpDecisions?: IDecision[];
  titleOverride?: string;
  rootRecommendation?: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  decision,
  onLoad,
  onDelete,
  loadId,
  followUpCount,
  followUpDecisions,
  titleOverride,
  rootRecommendation
}) => {
  const [isSharing, setIsSharing] = useState(false);
  
  const handleLoad = () => {
    console.log('Loading decision:', decision.id);
    onLoad(decision.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Deleting decision:', decision.id);
    onDelete(decision.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    try {
      const publicId = await shareDecision(decision);
      const shareUrl = `${window.location.origin}/shared/${publicId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien de partage copié dans le presse-papier !");
    } catch (error) {
      console.error('Error sharing decision:', error);
      toast.error("Erreur lors du partage");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TooltipProvider>
      <div 
        className="p-4 rounded-lg bg-card border cursor-pointer hover:bg-accent/50 transition-colors relative"
        onClick={handleLoad}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Titre principal avec emoji */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg">{decision.emoji}</span>
              <p className="font-semibold text-foreground truncate flex-1">
                {titleOverride || decision.dilemma}
              </p>
              {/* Questions de suivi - masquées sur mobile */}
              {typeof followUpCount === 'number' && followUpCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap cursor-help hover:text-foreground transition-colors">
                      + {followUpCount} question{followUpCount > 1 ? 's' : ''} de suivi
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {followUpDecisions?.slice(0, 5).map((followUp, index) => (
                        <div key={followUp.id} className="text-sm">
                          <p className="font-semibold text-foreground mb-1">
                            Q{index + 1}: {followUp.dilemma}
                          </p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {followUp.result.recommendation.length > 160 
                              ? `${followUp.result.recommendation.substring(0, 160)}...` 
                              : followUp.result.recommendation}
                          </p>
                        </div>
                      ))}
                      {followUpCount > 5 && (
                        <p className="text-xs text-muted-foreground italic pt-2 border-t">
                          ... et {followUpCount - 5} autre{followUpCount - 5 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            {/* Questions de suivi sur mobile - ligne séparée */}
            {typeof followUpCount === 'number' && followUpCount > 0 && (
              <div className="sm:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground cursor-help hover:text-foreground transition-colors">
                      + {followUpCount} question{followUpCount > 1 ? 's' : ''} de suivi
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {followUpDecisions?.slice(0, 5).map((followUp, index) => (
                        <div key={followUp.id} className="text-sm">
                          <p className="font-semibold text-foreground mb-1">
                            Q{index + 1}: {followUp.dilemma}
                          </p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {followUp.result.recommendation.length > 160 
                              ? `${followUp.result.recommendation.substring(0, 160)}...` 
                              : followUp.result.recommendation}
                          </p>
                        </div>
                      ))}
                      {followUpCount > 5 && (
                        <p className="text-xs text-muted-foreground italic pt-2 border-t">
                          ... et {followUpCount - 5} autre{followUpCount - 5 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            
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
              <DropdownMenuItem onClick={handleShare} disabled={isSharing}>
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
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
