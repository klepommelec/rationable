import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { getMonthlyTrendingTemplates, getLocalizedLabels, MonthlyTemplate } from '@/services/monthlyTemplatesService';
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
  const [templates, setTemplates] = useState<MonthlyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get current context from workspace, default to personal
  const currentContext = currentWorkspace?.use_context || 'personal';
  
  const labels = getLocalizedLabels(currentLanguage);

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const fetchedTemplates = await getMonthlyTrendingTemplates(currentContext, currentLanguage);
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error loading monthly templates:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [currentContext, currentLanguage]);

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

  // Don't render if loading or no templates available
  if (loading || templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 pt-12 m-0">
        {templates.map((template, index) => (
          <div
            key={template.id}
            style={{ animationDelay: `${index * 70}ms` }}
            className="animate-fade-in opacity-0 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePromptClick(template.prompt)}
              disabled={disabled}
              className="w-full text-xs sm:text-sm justify-start h-auto whitespace-normal text-left rounded-none py-[12px] hover:bg-primary/5 px-[12px] group"
            >
              <TrendingUp className="h-3 w-3 text-primary/70 flex-shrink-0" />
              <span className="truncate text-sm px-[4px] font-medium text-gray-500 line-clamp-2 group-hover:text-primary/70">
                {template.prompt}
              </span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyTrendingTemplates;