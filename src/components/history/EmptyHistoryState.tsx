import React from 'react';
import { History } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';

export const EmptyHistoryState: React.FC = () => {
  const { t } = useI18nUI();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-24">
      <History className="h-8 w-8 mb-4" />
      <h3 className="text-lg font-semibold">{t('history.list.emptyTitle')}</h3>
      <p className="text-sm">{t('history.list.emptyDescription')}</p>
    </div>
  );
};