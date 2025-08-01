
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SharedDecisionView from '@/components/SharedDecisionView';

const SharedDecision: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header avec logo et bouton de connexion */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/d57ec78c-b0f4-4550-b788-f14ae7d44a12.png" 
                alt="Rationable" 
                className="h-8 w-auto"
              />
            </div>
            
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Button>
          </div>
        </div>
        
        <SharedDecisionView />
      </div>
    </ThemeProvider>
  );
};

export default SharedDecision;
