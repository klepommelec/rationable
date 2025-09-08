
import React, { useState, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';
import { IDecision } from '@/types/decision';
import { HistorySearchBar } from './history/HistorySearchBar';
import { HistoryActions } from './history/HistoryActions';
import { HistoryItem } from './history/HistoryItem';
import { EmptyHistoryState } from './history/EmptyHistoryState';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface EnhancedDecisionHistoryProps {
  history: IDecision[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  onUpdateCategory: (decisionId: string, categoryId: string | undefined) => void;
}

export const EnhancedDecisionHistory: React.FC<EnhancedDecisionHistoryProps> = ({
  history,
  onLoad,
  onDelete,
  onClear,
  onClose,
  onUpdateCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [visibleCount, setVisibleCount] = useState(10);
  const { t } = useI18nUI();

  console.log('EnhancedDecisionHistory - onLoad function:', typeof onLoad);

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = history.filter(decision => {
      const matchesSearch = decision.dilemma.toLowerCase().includes(searchQuery.toLowerCase()) || decision.result.recommendation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || decision.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp - a.timestamp;
      } else {
        const catA = a.category || 'zzz';
        const catB = b.category || 'zzz';
        return catA.localeCompare(catB);
      }
    });
  }, [history, searchQuery, selectedCategory, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = history.reduce((acc, decision) => {
      const cat = decision.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  }, [history]);

  // Regrouper l'historique par threadId (ou par id si absent)
  const groupedThreads = useMemo(() => {
    const groups = new Map<string, IDecision[]>();
    for (const d of filteredAndSortedHistory) {
      const key = d.threadId || d.id;
      const arr = groups.get(key) || [];
      arr.push(d);
      groups.set(key, arr);
    }

    const items = Array.from(groups.entries()).map(([key, decisions]) => {
      const sorted = [...decisions].sort((a, b) => a.timestamp - b.timestamp);
      const root = sorted.find(d => (d.threadId || d.id) === key) || sorted[0];
      const last = sorted[sorted.length - 1];
      const followUps = sorted.filter(d => d !== root); // Toutes les questions de suivi
      return {
        key,
        root,
        last,
        followUps,
        followUpCount: followUps.length
      };
    });

    // Trier par date de la dernière activité (desc)
    items.sort((a, b) => b.last.timestamp - a.last.timestamp);
    return items;
  }, [filteredAndSortedHistory]);

  // Reset visible count when search/filter changes
  React.useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedCategory, sortBy]);

  // Get visible items for pagination
  const visibleThreads = groupedThreads.slice(0, visibleCount);
  const hasMoreItems = visibleCount < groupedThreads.length;

  const loadMoreItems = () => {
    setVisibleCount(prev => Math.min(prev + 10, groupedThreads.length));
  };

  const handleLoad = (id: string) => {
    console.log('EnhancedDecisionHistory - handleLoad called with id:', id);
    onLoad(id);
    onClose();
  };
  if (history.length === 0) {
    return <EmptyHistoryState />;
  }

  return (
    <div className="flex flex-col h-full mt-4">
      {/* En-tête avec actions */}
      <div className="space-y-4 mb-4">
        <HistorySearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
          categoryCounts={categoryCounts}
          filteredDecisions={filteredAndSortedHistory}
          onClear={onClear}
        />

        <HistoryActions />
      </div>

      {/* Liste des décisions */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {filteredAndSortedHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>{t('history.list.emptyMessage')}</p>
            </div>
          ) : (
            visibleThreads.map(item => (
              <HistoryItem 
                key={item.last.id} 
                decision={item.last} 
                onLoad={handleLoad} 
                onDelete={onDelete} 
                followUpCount={item.followUpCount}
                followUpDecisions={item.followUps}
                titleOverride={item.root.dilemma}
                rootRecommendation={item.root.result.recommendation}
              />
            ))
          )}
          
          {/* Bouton "Voir plus" */}
          {hasMoreItems && (
            <div className="flex justify-center pt-4">
               <Button 
                variant="outline" 
                onClick={loadMoreItems}
                className="min-w-[120px] flex items-center gap-2"
              >
                {t('history.list.seeMore')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
