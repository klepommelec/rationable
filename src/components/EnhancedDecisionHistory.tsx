
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, History, RotateCcw, Search, Filter, FileDown, Share2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IDecision, DEFAULT_CATEGORIES } from '@/types/decision';
import { CategoryBadge } from './CategorySelector';
import { ExportMenu } from './ExportMenu';

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
      const matchesSearch = decision.dilemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           decision.result.recommendation.toLowerCase().includes(searchQuery.toLowerCase());
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
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 pt-16">
        <History className="h-16 w-16 mb-4" />
        <h3 className="text-lg font-semibold">Aucun historique</h3>
        <p className="text-sm">Vos décisions analysées apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mt-4">
      {/* En-tête avec actions */}
      <div className="space-y-4 mb-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="uncategorized">Non catégorisées ({categoryCounts.uncategorized || 0})</SelectItem>
              {DEFAULT_CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">({categoryCounts[category.id] || 0})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'date' | 'category') => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Par date
                </div>
              </SelectItem>
              <SelectItem value="category">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Par catégorie
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions globales */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <ExportMenu decisions={filteredAndSortedHistory} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Tout effacer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible et supprimera tout votre historique de décisions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onClear}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Liste des décisions */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {filteredAndSortedHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Aucune décision ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            filteredAndSortedHistory.map(decision => (
              <div key={decision.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{decision.emoji}</span>
                      {decision.category && <CategoryBadge categoryId={decision.category} />}
                    </div>
                    <p className="font-semibold text-slate-300 truncate">{decision.dilemma}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(decision.timestamp).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {decision.result.recommendation}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleLoad(decision.id)} className="border-slate-600">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Charger
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(decision.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
