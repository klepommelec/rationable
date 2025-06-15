
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ICriterion } from '@/types/decision';
import { CriterionRow } from './CriterionRow';
import { toast } from 'sonner';

interface CriteriaManagerProps {
  criteria: ICriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<ICriterion[]>>;
  isInteractionDisabled: boolean;
}

export const CriteriaManager = ({ criteria, setCriteria, isInteractionDisabled }: CriteriaManagerProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCriteria((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        toast.info("L'ordre des critères a été mis à jour.", { duration: 2000 });
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleNameChange = (id: string, name: string) => {
    setCriteria((items) =>
      items.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleRemove = (id: string) => {
    if (criteria.length <= 2) {
      toast.error("Vous devez conserver au moins 2 critères.");
      return;
    }
    setCriteria((items) => items.filter((item) => item.id !== id));
    toast.success("Critère supprimé.");
  };

  const handleAdd = () => {
    if (criteria.length >= 8) {
      toast.error("Vous ne pouvez pas ajouter plus de 8 critères.");
      return;
    }
    const newCriterion: ICriterion = {
      id: crypto.randomUUID(),
      name: '',
    };
    setCriteria((items) => [...items, newCriterion]);
    toast.success("Nouveau critère ajouté.");
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-accent border animate-fade-in">
      <h3 className="font-semibold text-lg">
        Gérez les critères de décision
      </h3>
      <p className="text-sm text-muted-foreground">
        Modifiez, réorganisez (par glisser-déposer) ou supprimez les critères. L'ordre est important et reflète leur poids dans la décision.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={criteria} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {criteria.map((criterion) => (
              <CriterionRow
                key={criterion.id}
                criterion={criterion}
                onNameChange={handleNameChange}
                onRemove={handleRemove}
                isRemoveDisabled={criteria.length <= 2}
                isDragDisabled={isInteractionDisabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button onClick={handleAdd} disabled={isInteractionDisabled || criteria.length >= 8} variant="outline" size="sm">
        <PlusCircle className="h-4 w-4 mr-2" />
        Ajouter un critère
      </Button>
    </div>
  );
};
