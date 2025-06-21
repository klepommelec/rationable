
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/types/decision';

interface HistorySearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'date' | 'category';
  setSortBy: (sort: 'date' | 'category') => void;
  categoryCounts: Record<string, number>;
}

export const HistorySearchBar: React.FC<HistorySearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categoryCounts
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
