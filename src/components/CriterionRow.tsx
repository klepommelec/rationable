
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICriterion } from './DecisionMaker';

interface CriterionRowProps {
  criterion: ICriterion;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  isRemoveDisabled: boolean;
  isDragDisabled: boolean;
}

export const CriterionRow = ({ criterion, onNameChange, onRemove, isRemoveDisabled, isDragDisabled }: CriterionRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: criterion.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2" {...attributes}>
      <Button variant="ghost" size="icon" {...listeners} className="cursor-grab" disabled={isDragDisabled}>
        <GripVertical className="h-5 w-5 text-slate-500" />
      </Button>
      <Input
        placeholder={`Critère`}
        value={criterion.name}
        onChange={(e) => onNameChange(criterion.id, e.target.value)}
        className="bg-slate-800 border-slate-700 focus:ring-cyan-500 flex-grow"
        disabled={isDragDisabled}
      />
      <Button variant="ghost" size="icon" onClick={() => onRemove(criterion.id)} disabled={isRemoveDisabled || isDragDisabled}>
        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500 transition-colors" />
      </Button>
    </div>
  );
};

