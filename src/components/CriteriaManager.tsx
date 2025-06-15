import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { ICriterion } from '@/types/decision';
import { CriterionRow } from './CriterionRow';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    <Collapsible defaultOpen className="p-4 rounded-lg bg-accent border animate-fade-in">
      <CollapsibleTrigger className="flex justify-between items-center w-full group">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg text-left">
            Gérez les critères de décision
          </h3>
          <span className="text-sm font-medium text-muted-foreground">({criteria.length}/8)</span>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-4">
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
      </CollapsibleContent>
    </Collapsible>
  );
};
