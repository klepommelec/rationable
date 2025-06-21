
import React from 'react';
import { History } from 'lucide-react';

export const EmptyHistoryState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
      <History className="h-16 w-16 mb-4" />
      <h3 className="text-lg font-semibold">Aucun historique</h3>
      <p className="text-sm">Vos décisions analysées apparaîtront ici.</p>
    </div>
  );
};
