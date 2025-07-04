import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, Info, RefreshCw } from 'lucide-react';
import { ICriterion } from '@/types/decision';
import { CriterionRow } from './CriterionRow';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CriteriaManagerProps {
  criteria: ICriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<ICriterion[]>>;
  isInteractionDisabled: boolean;
  onUpdateAnalysis?: () => void;
  hasChanges?: boolean;
  currentDecisionId?: string | null;
}

export const CriteriaManager = ({
  criteria,
  setCriteria,
  isInteractionDisabled,
  onUpdateAnalysis,
  hasChanges = false,
  currentDecisionId
}: CriteriaManagerProps) => {
  const [visibleCriteria, setVisibleCriteria] = useState<string[]>([]);
  const [lastCriteriaCount, setLastCriteriaCount] = useState(0);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));

  // Animation seulement pour les nouveaux critères
  useEffect(() => {
    if (criteria.length > lastCriteriaCount) {
      // Seulement animer les nouveaux critères
      const newCriteria = criteria.slice(lastCriteriaCount);
      newCriteria.forEach((criterion, index) => {
        setTimeout(() => {
          setVisibleCriteria(prev => [...prev, criterion.id]);
        }, index * 100);
      });
    } else if (criteria.length === 0) {
      // Reset complet si plus de critères
      setVisibleCriteria([]);
    } else {
      // Pour les suppressions ou réorganisations, montrer tous les critères existants immédiatement
      setVisibleCriteria(criteria.map(c => c.id));
    }
    setLastCriteriaCount(criteria.length);
  }, [criteria, lastCriteriaCount]);

  // Initialiser tous les critères comme visibles au premier rendu
  useEffect(() => {
    if (criteria.length > 0 && visibleCriteria.length === 0 && lastCriteriaCount === 0) {
      setVisibleCriteria(criteria.map(c => c.id));
      setLastCriteriaCount(criteria.length);
    }
  }, [criteria, visibleCriteria.length, lastCriteriaCount]);

  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      setCriteria(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        toast.info("L'ordre des critères a été mis à jour.", {
          duration: 1600
        });
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleNameChange = (id: string, name: string) => {
    setCriteria(items => items.map(item => item.id === id ? {
      ...item,
      name
    } : item));
  };

  const handleRemove = (id: string) => {
    if (criteria.length <= 2) {
      toast.error("Vous devez conserver au moins 2 critères.");
      return;
    }
    setCriteria(items => items.filter(item => item.id !== id));
    setVisibleCriteria(prev => prev.filter(criterionId => criterionId !== id));
    toast.success("Critère supprimé.");
  };

  const handleAdd = () => {
    if (criteria.length >= 8) {
      toast.error("Vous ne pouvez pas ajouter plus de 8 critères.");
      return;
    }
    const newCriterion: ICriterion = {
      id: crypto.randomUUID(),
      name: ''
    };
    setCriteria(items => [...items, newCriterion]);
    toast.success("Nouveau critère ajouté.");
  };

  return (
    <Collapsible defaultOpen className="p-4 animate-fade-in shadow-neutral-500 rounded-xl border bg-white shadow-200">
      <CollapsibleTrigger className="flex justify-between items-center w-full group">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg text-left">
            Gérez les critères de décision
          </h3>
          <span className="text-sm font-medium text-muted-foreground">
            ({criteria.length}/8)
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifiez, réorganisez (par glisser-déposer) ou supprimez les critères. L'ordre est important et reflète leur poids dans la décision.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-160 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={criteria} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {criteria.map(criterion => (
                <div
                  key={criterion.id}
                  className={`transition-all duration-300 ease-out ${visibleCriteria.includes(criterion.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                >
                  <CriterionRow
                    criterion={criterion}
                    onNameChange={handleNameChange}
                    onRemove={handleRemove}
                    isRemoveDisabled={criteria.length <= 2}
                    isDragDisabled={isInteractionDisabled}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            disabled={isInteractionDisabled || criteria.length >= 8}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un critère
          </Button>
          
          {hasChanges && onUpdateAnalysis && (
            <Button
              onClick={onUpdateAnalysis}
              disabled={isInteractionDisabled}
              variant="default"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mettre à jour l'analyse
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
