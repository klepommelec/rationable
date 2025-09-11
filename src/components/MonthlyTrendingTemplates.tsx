import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { getMonthlyTrendingTemplates, getLocalizedLabels } from '@/services/monthlyTemplatesService';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useWorkspaces } from '@/hooks/useWorkspaces';

interface MonthlyTrendingTemplatesProps {
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
}

const MonthlyTrendingTemplates: React.FC<MonthlyTrendingTemplatesProps> = ({
  onPromptSelect,
  disabled = false
}) => {
  const { currentLanguage } = useI18nUI();
  const { currentWorkspace } = useWorkspaces();
  
  // Get current context from workspace, default to personal
  const currentContext = currentWorkspace?.use_context || 'personal';
  
  // Get templates for current context and language
  const templates = getMonthlyTrendingTemplates(currentContext, currentLanguage);
  const labels = getLocalizedLabels(currentLanguage);

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt);
    // Scroll to dilemma input area
    setTimeout(() => {
      const dilemmaInput = document.getElementById('dilemma-input');
      if (dilemmaInput) {
        dilemmaInput.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        dilemmaInput.focus();
      }
    }, 100);
  };

  // Don't render if no templates available
  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            onClick={() => handlePromptClick(template.prompt)}
            disabled={disabled}
            className="text-xs sm:text-sm justify-start h-auto whitespace-normal text-left rounded-full py-[8px] hover:bg-primary/5 px-[13px]"
          >
            <TrendingUp className="h-3 w-3 text-primary/70 flex-shrink-0" />
            <span className="truncate text-sm px-[4px] font-medium text-gray-500 line-clamp-2">
              {template.prompt}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MonthlyTrendingTemplates;