
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ICriterion } from '@/types/decision';

interface CriterionRowProps {
  criterion: ICriterion;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  isRemoveDisabled: boolean;
  isDragDisabled: boolean;
  onWeightChange?: (criteriaId: string, weight: number) => void;
}

export const CriterionRow = ({
  criterion,
  onNameChange,
  onRemove,
  isRemoveDisabled,
  isDragDisabled,
  onWeightChange
}: CriterionRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: criterion.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const getWeightLabel = (weight: number) => {
    switch (weight) {
      case 1: return { label: "Très faible", color: "bg-red-100 text-red-800" };
      case 2: return { label: "Faible", color: "bg-orange-100 text-orange-800" };
      case 3: return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
      case 4: return { label: "Important", color: "bg-blue-100 text-blue-800" };
      case 5: return { label: "Très important", color: "bg-green-100 text-green-800" };
      default: return { label: "Moyen", color: "bg-yellow-100 text-yellow-800" };
    }
  };

  const weightInfo = getWeightLabel(criterion.weight);

  const handleWeightChange = (newWeight: number[]) => {
    if (onWeightChange) {
      onWeightChange(criterion.id, newWeight[0]);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div className="flex h-8 gap-0">
        <Button 
          variant="ghost" 
          size="icon" 
          {...listeners} 
          className="cursor-grab" 
          disabled={isDragDisabled}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Input 
          placeholder={`Critère`} 
          value={criterion.name} 
          onChange={e => onNameChange(criterion.id, e.target.value)} 
          disabled={isDragDisabled} 
          className="flex-grow h-9" 
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(criterion.id)} 
          disabled={isRemoveDisabled || isDragDisabled}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
        </Button>
      </div>
      
      {onWeightChange && (
        <div className="ml-10 mr-10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Importance</span>
            <Badge className={`${weightInfo.color} text-xs`}>
              {weightInfo.label}
            </Badge>
          </div>
          <Slider
            value={[criterion.weight]}
            onValueChange={handleWeightChange}
            min={1}
            max={5}
            step={1}
            disabled={isDragDisabled}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
