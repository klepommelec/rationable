
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from 'lucide-react';
import { IDecision } from '@/types/decision';
import { CategoryBadge } from '../CategorySelector';

interface HistoryItemProps {
  decision: IDecision;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  decision,
  onLoad,
  onDelete
}) => {
  const handleLoad = () => {
    console.log('Loading decision:', decision.id);
    onLoad(decision.id);
  };

  const handleDelete = () => {
    console.log('Deleting decision:', decision.id);
    onDelete(decision.id);
  };

  return (
    <div className="p-3 rounded-lg bg-card border space-y-2">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{decision.emoji}</span>
            <p className="font-semibold text-foreground truncate flex-1">{decision.dilemma}</p>
          </div>
          {decision.category && (
            <div className="mb-1">
              <CategoryBadge categoryId={decision.category} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(decision.timestamp).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {decision.result.recommendation}
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleLoad}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Charger
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
