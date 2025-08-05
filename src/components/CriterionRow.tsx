import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ICriterion } from '@/types/decision';
interface CriterionRowProps {
  criterion: ICriterion;
  onNameChange: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  isRemoveDisabled: boolean;
  isDragDisabled: boolean;
}
export const CriterionRow = ({
  criterion,
  onNameChange,
  onRemove,
  isRemoveDisabled,
  isDragDisabled
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
  return <div ref={setNodeRef} style={style} className="flex h-8 gap-1 items-center ">
      <Button variant="ghost" size="icon" disabled={isDragDisabled} className="cursor-grab h-8 w-9">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <Input placeholder={`Critère`} value={criterion.name} onChange={e => onNameChange(criterion.id, e.target.value)} disabled={isDragDisabled} className="flex-grow h-9 " />
      <Button variant="ghost" size="icon" onClick={() => onRemove(criterion.id)} disabled={isRemoveDisabled || isDragDisabled} className="h-8 w-9">
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
      </Button>
    </div>;
};