import React, { useState, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { IDecision } from '@/types/decision';
import { HistorySearchBar } from './history/HistorySearchBar';
import { HistoryActions } from './history/HistoryActions';
import { HistoryItem } from './history/HistoryItem';
import { EmptyHistoryState } from './history/EmptyHistoryState';
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
  const handleLoad = (id: string) => {
    onLoad(id);
    onClose();
  };
  if (history.length === 0) {
    return <EmptyHistoryState />;
  }
  return <div className="flex flex-col h-full mt-4">
      {/* En-tête avec actions */}
      <div className="space-y-4 mb-4">
        <HistorySearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} sortBy={sortBy} setSortBy={setSortBy} categoryCounts={categoryCounts} />

        <HistoryActions filteredDecisions={filteredAndSortedHistory} onClear={onClear} />
      </div>

      {/* Liste des décisions */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {filteredAndSortedHistory.length === 0 ? <div className="text-center text-muted-foreground py-8">
              <p>Aucune décision ne correspond à vos critères de recherche.</p>
            </div> : filteredAndSortedHistory.map(decision => <HistoryItem key={decision.id} decision={decision} onLoad={handleLoad} onDelete={onDelete} />)}
        </div>
      </ScrollArea>
    </div>;
};