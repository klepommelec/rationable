
import React from 'react';
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_CATEGORIES } from '@/types/decision';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface TemplateFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  sortBy: 'newest' | 'popular' | 'most_copied';
  setSortBy: (value: 'newest' | 'popular' | 'most_copied') => void;
}

const TemplateFilters = ({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy
}: TemplateFiltersProps) => {
  const { t } = useI18nUI();
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('templates.filters.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="h-10">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t('templates.filters.categoryAll')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('templates.filters.categoryAll')}</SelectItem>
          {DEFAULT_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.emoji} {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
        <SelectTrigger className="h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('templates.filters.sort.newest')}</SelectItem>
          <SelectItem value="popular">{t('templates.filters.sort.popular')}</SelectItem>
          <SelectItem value="most_copied">{t('templates.filters.sort.mostCopied')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateFilters;
