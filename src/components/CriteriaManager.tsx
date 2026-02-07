import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Info, RefreshCw, Database } from 'lucide-react';
import { ICriterion, IResult } from '@/types/decision';
import { CriterionRow } from './CriterionRow';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18nUI } from '@/contexts/I18nUIContext';
import { LinkVerifierService } from '@/services/linkVerifierService';

interface VerifiedSource {
  url: string;
  title?: string;
  status?: 'valid' | 'invalid' | 'redirect' | 'timeout' | 'pending';
  finalUrl?: string;
  error?: string;
}

interface CriteriaManagerProps {
  criteria: ICriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<ICriterion[]>>;
  isInteractionDisabled: boolean;
  onUpdateAnalysis?: () => void;
  hasChanges?: boolean;
  currentDecisionId?: string | null;
  isNewDecision?: boolean;
  isManualDecision?: boolean;
  /** Résultat courant (quand une décision est affichée) pour la section Sources du panneau */
  result?: IResult | null;
  currentDecision?: any;
}
export const CriteriaManager = ({
  criteria,
  setCriteria,
  isInteractionDisabled,
  onUpdateAnalysis,
  hasChanges = false,
  currentDecisionId,
  isNewDecision = false,
  isManualDecision = false,
  result = null,
  currentDecision,
}: CriteriaManagerProps) => {
  const [visibleCriteria, setVisibleCriteria] = useState<string[]>([]);
  const [lastCriteriaCount, setLastCriteriaCount] = useState(0);
  const [isOpen, setIsOpen] = useState(isNewDecision);
  const [verifiedSources, setVerifiedSources] = useState<VerifiedSource[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const { t } = useI18nUI();

  const allSources = useMemo(() => {
    if (!result) return [];
    const sources: (string | { url: string; title?: string })[] = [
      ...(result.realTimeData?.sources || []),
      ...(result.workspaceData?.documentSources || []),
      ...(result.infoLinks?.map(link => ({ url: link.url, title: link.title })) || [])
    ];
    const uniqueUrls = new Set<string>();
    return sources.filter(source => {
      const url = typeof source === 'string' ? source : source.url;
      if (uniqueUrls.has(url)) return false;
      uniqueUrls.add(url);
      return true;
    }).map(source => typeof source === 'string' ? { url: source, title: undefined } : source);
  }, [result]);

  const handleScanSources = async () => {
    if (allSources.length === 0) return;
    setIsVerifying(true);
    try {
      const linksToVerify = allSources.map(source => ({
        url: source.url,
        title: source.title || '',
        description: ''
      }));
      const { validLinks, invalidLinks } = await LinkVerifierService.verifyLinks(linksToVerify);
      const verified: VerifiedSource[] = allSources.map(source => {
        const validLink = validLinks.find(v => v.url === source.url);
        const invalidLink = invalidLinks.find(i => i.url === source.url);
        if (validLink) return { ...source, status: 'valid' as const, finalUrl: validLink.url };
        if (invalidLink) return { ...source, status: invalidLink.status as any, error: invalidLink.error };
        return { ...source, status: 'valid' as const };
      });
      setVerifiedSources(verified);
    } catch (error) {
      console.error('Source verification failed:', error);
      setVerifiedSources(allSources.map(source => ({ ...source, status: 'valid' as const })));
    } finally {
      setIsVerifying(false);
    }
  };
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
        toast.info(t('criteria.reorderSuccess'), {
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
    // En mode manuel, on peut supprimer tous les critères
    // En mode intelligent, on garde au moins 2 critères
    if (!isManualDecision && criteria.length <= 2) {
      toast.error(t('criteria.minCriteriaError'));
      return;
    }
    setCriteria(items => items.filter(item => item.id !== id));
    setVisibleCriteria(prev => prev.filter(criterionId => criterionId !== id));
    toast.success(t('criteria.removeSuccess'));
  };
  const handleAdd = () => {
    const newCriterion: ICriterion = {
      id: crypto.randomUUID(),
      name: ''
    };
    setCriteria(items => [...items, newCriterion]);
    toast.success(t('criteria.addSuccess'));
  };
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-9 px-3 py-1">
          <span className="font-medium">
            {t('criteria.title')}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            ({criteria.length})
          </span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex cursor-help"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{t('criteria.tooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {t('criteria.title')}
            <span className="text-sm font-medium text-muted-foreground">
              ({criteria.length})
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pt-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={criteria} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {criteria.map(criterion => (
                  <div key={criterion.id} className={`transition-all duration-300 ease-out ${visibleCriteria.includes(criterion.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                    <CriterionRow 
                      criterion={criterion} 
                      onNameChange={handleNameChange} 
                      onRemove={handleRemove} 
                      isRemoveDisabled={!isManualDecision && criteria.length <= 2} 
                      isDragDisabled={isInteractionDisabled} 
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <div className="flex justify-between items-center gap-2">
            <Button onClick={handleAdd} disabled={isInteractionDisabled} variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('criteria.addButton')}
            </Button>
            
            {onUpdateAnalysis && hasChanges && (
              <Button
                onClick={onUpdateAnalysis}
                disabled={isInteractionDisabled}
                variant="default"
                size="sm"
                className="bg-black hover:bg-black/90 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('criteria.updateAnalysis')}
              </Button>
            )}
          </div>

          {result != null && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-medium">{t('dataAccuracy.sourcesSection')}</h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
                onClick={handleScanSources}
                disabled={isVerifying || allSources.length === 0}
              >
                <Database className="h-4 w-4" />
                {isVerifying ? t('notifications.sourceVerification') : t('dataAccuracy.scanSources')}
              </Button>
              <div className="space-y-1.5 max-h-48 overflow-y-auto mb-2">
                {allSources.length === 0 ? (
                  <div className="text-xs text-muted-foreground">{t('dataAccuracy.noExternalSources')}</div>
                ) : isVerifying ? (
                  <div className="text-xs text-muted-foreground">{t('notifications.sourceVerification')}</div>
                ) : verifiedSources.length > 0 ? (
                  (verifiedSources
                    .filter(s => ['valid', 'redirect'].includes(s.status || 'valid'))
                    .map((source, index) => {
                      const finalUrl = source.finalUrl || source.url;
                      return (
                        <div key={index} className="text-xs">
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 break-all"
                          >
                            <Database className="h-3 w-3 flex-shrink-0" />
                            {source.title || (finalUrl.length > 45 ? `${finalUrl.substring(0, 45)}...` : finalUrl)}
                          </a>
                        </div>
                      );
                    }))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {t('dataAccuracy.scanToShowLinks')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};