
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SharedDecisionView from '@/components/SharedDecisionView';

const SharedDecision: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header avec logo et bouton de connexion */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:underline transition-all duration-200">
              <img src="/lovable-uploads/58a481be-b921-4741-9446-bea4d2b2d69d.png" alt="Rationable Logo" className="h-9 w-9 rounded-none" />
              <span className="text-xl font-medium">Rationable</span>
            </Link>
            
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
