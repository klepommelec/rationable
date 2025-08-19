
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronDown, Tag } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES, IDecisionCategory } from '@/types/decision';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { getCategoryLabel } from '@/utils/i18nHelpers';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
  showLabel?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  showLabel = true
}) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useI18nUI();
  
  const selectedCat = DEFAULT_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <div className="flex items-center gap-2">
      {showLabel && <Tag className="h-4 w-4 text-muted-foreground" />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between min-w-[200px]"
          >
            {selectedCat ? (
              <div className="flex items-center gap-2">
                <span>{selectedCat.emoji}</span>
                <span>{getCategoryLabel(selectedCat.id, t, selectedCat.name)}</span>
              </div>
            ) : (
              t('categorySelector.placeholder')
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={t('categorySelector.searchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('categorySelector.empty')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onCategoryChange(undefined);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedCategory ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {t('categorySelector.none')}
                </CommandItem>
                {DEFAULT_CATEGORIES.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      onCategoryChange(category.id === selectedCategory ? undefined : category.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory === category.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{category.emoji}</span>
                    {getCategoryLabel(category.id, t, category.name)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const CategoryBadge: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
  const { t } = useI18nUI();
  
  if (!category) return null;
  
  return (
    <Badge variant="secondary" className="text-xs">
      {getCategoryLabel(category.id, t, category.name)}
    </Badge>
  );
};
