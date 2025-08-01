
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Eye, Calendar, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSharedDecision, SharedDecision } from '@/services/sharedDecisionService';
import { CategoryBadge } from './CategorySelector';
import ValidatedLink from './ValidatedLink';
import { CommentSection } from './comments/CommentSection';

const SharedDecisionView: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const [sharedDecision, setSharedDecision] = useState<SharedDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedDecision = async () => {
      if (!publicId) {
        setError('ID de partage manquant');
        setLoading(false);
        return;
      }

      try {
        const decision = await getSharedDecision(publicId);
        if (!decision) {
          setError('Cette décision partagée n\'existe pas ou a expiré');
        } else {
          setSharedDecision(decision);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDecision();
  }, [publicId]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (error) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !sharedDecision) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Décision introuvable</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decision = sharedDecision.decision_data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={() => navigate('/')} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">{decision.emoji}</span>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{decision.dilemma}</h1>
            {decision.category && (
              <div className="mt-2">
                <CategoryBadge categoryId={decision.category} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Partagé le {new Date(sharedDecision.created_at).toLocaleDateString('fr-FR')}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {sharedDecision.view_count} {sharedDecision.view_count === 1 ? 'vue' : 'vues'}
          </div>
          <Button onClick={copyShareLink} variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Copier le lien
          </Button>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Recommendation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-green-600 dark:text-green-400">✅ Recommandation</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">{decision.result.recommendation}</h3>
          {decision.result.description && (
            <p className="text-muted-foreground">{decision.result.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Criteria */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Critères d'évaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {decision.criteria.map(criterion => (
              <Badge key={criterion.id} variant="outline">
                {criterion.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      {decision.result.breakdown && decision.result.breakdown.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analyse détaillée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decision.result.breakdown.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                    <h4 className="font-semibold text-lg">{item.option}</h4>
                    <div className="flex items-center gap-1 self-start sm:self-center">
                      <span className="text-xs text-muted-foreground">En savoir plus</span>
                      <ValidatedLink
                        link={{
                          title: `Rechercher ${item.option}`,
                          url: `https://www.google.fr/search?q=${encodeURIComponent(item.option)}`
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">✅ Avantages</h5>
                      <ul className="text-sm space-y-1">
                        {item.pros.map((pro, idx) => (
                          <li key={idx} className="text-muted-foreground">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">❌ Inconvénients</h5>
                      <ul className="text-sm space-y-1">
                        {item.cons.map((con, idx) => (
                          <li key={idx} className="text-muted-foreground">• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {((decision.result.infoLinks && decision.result.infoLinks.length > 0) || 
        (decision.result.shoppingLinks && decision.result.shoppingLinks.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {decision.result.infoLinks && decision.result.infoLinks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">📚 Ressources d'information</h4>
                  <div className="space-y-2">
                    {decision.result.infoLinks.map((link, index) => (
                      <ValidatedLink
                        key={index}
                        link={link}
                        fallbackSearchQuery={decision.dilemma}
                        className="block p-2 rounded border hover:bg-muted text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {decision.result.shoppingLinks && decision.result.shoppingLinks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">🛒 Liens d'achat</h4>
                  <div className="space-y-2">
                    {decision.result.shoppingLinks.map((link, index) => (
                      <ValidatedLink
                        key={index}
                        link={link}
                        fallbackSearchQuery={`acheter ${decision.result.recommendation}`}
                        className="block p-2 rounded border hover:bg-muted text-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section des commentaires */}
      <div className="mt-8">
        <Separator className="my-6" />
        <CommentSection 
          decisionId={sharedDecision.decision_data.id} 
          commentType="general"
          title="Commentaires sur cette décision"
          placeholder="Partagez vos réflexions sur cette décision..."
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Cette décision a été générée avec l'Assistant de Décision IA
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Créer ma propre analyse de décision
        </Button>
      </div>
    </div>
  );
};

export default SharedDecisionView;
