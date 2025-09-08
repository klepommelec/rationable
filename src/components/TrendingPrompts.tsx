import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingPrompts } from '@/hooks/useTrendingPrompts';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface TrendingPromptsProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
}

const TrendingPrompts: React.FC<TrendingPromptsProps> = ({
  onPromptSelect,
  disabled = false
}) => {
  const { prompts, isLoading, error, countryName, refreshPrompts } = useTrendingPrompts();
  const { t } = useI18nUI();

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt);
    // Scroll to dilemma input area
    setTimeout(() => {
      const dilemmaInput = document.getElementById('dilemma-input');
      if (dilemmaInput) {
        dilemmaInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dilemmaInput.focus();
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || prompts.length === 0) {
    return null; // Will show fallback templates in DilemmaSetup
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('dilemmaSetup.trending.title').replace('{country}', countryName)}
        </h3>
        {prompts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPrompts}
            disabled={disabled || isLoading}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('dilemmaSetup.trending.refresh')}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handlePromptClick(prompt)}
            disabled={disabled}
            className="text-xs sm:text-sm justify-start h-auto whitespace-normal text-left rounded-full py-[8px] px-[8px] hover:bg-primary/5"
          >
            <span className="truncate text-sm px-[4px] font-medium text-gray-500 line-clamp-2">
              {prompt}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TrendingPrompts;