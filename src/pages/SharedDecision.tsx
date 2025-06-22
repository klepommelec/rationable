
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ThemeToggle';
import SharedDecisionView from '@/components/SharedDecisionView';

const SharedDecision: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header avec toggle de thème */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-2 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
        
        <SharedDecisionView />
      </div>
    </ThemeProvider>
  );
};

export default SharedDecision;
