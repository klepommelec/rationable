import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { getTemplatePreview } from '@/services/templatePreviewService';
import { IDecision } from '@/types/decision';
import { I18nUIProvider } from '@/contexts/I18nUIContext';
import { useI18nUI } from '@/contexts/I18nUIContext';
import AnalysisResult from '@/components/decision-maker/AnalysisResult';

const TemplatePreviewContent: React.FC = () => {
  const { previewId } = useParams<{ previewId: string }>();
  const navigate = useNavigate();
  const { t } = useI18nUI();
  const [decision, setDecision] = useState<IDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewId) {
      setError('ID de preview manquant');
      setLoading(false);
      return;
    }

    try {
      const templateData = getTemplatePreview(previewId);
      if (templateData) {
        setDecision(templateData);
      } else {
        setError('Template preview introuvable ou expiré');
      }
    } catch (err) {
      console.error('Error loading template preview:', err);
      setError('Erreur lors du chargement du template');
    } finally {
      setLoading(false);
    }
  }, [previewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template introuvable</h1>
          <p className="text-muted-foreground mb-6">{error || 'Ce template n\'existe plus ou a expiré.'}</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

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
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Banner pour indiquer que c'est un template */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-primary">Aperçu du template</h2>
                  <p className="text-sm text-muted-foreground">
                    Ceci est un exemple d'analyse de décision. Connectez-vous pour créer vos propres analyses.
                  </p>
                </div>
                <Button onClick={() => navigate('/auth?tab=signup')} size="sm">
                  Commencer gratuitement
                </Button>
              </div>
            </div>

            {/* Analysis Result */}
            <AnalysisResult 
              result={decision.result}
              isUpdating={false}
              analysisStep=""
              currentDecision={decision}
              dilemma={decision.dilemma}
              onUpdateDecision={() => {}}
              onFollowUpQuestion={() => {}}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

const TemplatePreview: React.FC = () => {
  return (
    <I18nUIProvider>
      <TemplatePreviewContent />
    </I18nUIProvider>
  );
};

export default TemplatePreview;