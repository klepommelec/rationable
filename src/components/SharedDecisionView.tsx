
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
import { useI18nUI } from '@/contexts/I18nUIContext';
import { useDecisionHistory } from '@/hooks/useDecisionHistory';
import { Plus } from 'lucide-react';

const SharedDecisionView: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { t, getLocaleTag } = useI18nUI();
  const { addDecision } = useDecisionHistory();
  const [sharedDecision, setSharedDecision] = useState<SharedDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedDecision = async () => {
      if (!publicId) {
        setError(t('sharedDecisionView.missingPublicId'));
        setLoading(false);
        return;
      }

      try {
        // Extract publicId from URL if it contains a slug (format: slug-publicId)
        const actualPublicId = publicId.includes('-') ? publicId.split('-').pop() || publicId : publicId;
        
        const decision = await getSharedDecision(actualPublicId);
        if (!decision) {
          setError(t('sharedDecisionView.notFoundDescription'));
        } else {
          setSharedDecision(decision);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('sharedDecisionView.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDecision();
  }, [publicId, t]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('collaboration.linkCopiedToast'));
    } catch (error) {
      toast.error(t('collaboration.linkCopyError'));
    }
  };

  const copyToWorkspace = () => {
    if (!sharedDecision) return;
    
    const newDecision = {
      ...sharedDecision.decision_data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    addDecision(newDecision);
    toast.success(t('sharedDecisionView.copySuccess'));
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
            <h2 className="text-2xl font-bold mb-4 text-red-500">{t('sharedDecisionView.notFound')}</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('sharedDecisionView.backToHome')}
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
          {t('sharedDecisionView.backToHome')}
        </Button>
        
        {/* Emoji above title for all screen sizes */}
        <div className="text-center mb-4">
          <span className="text-4xl">{decision.emoji}</span>
        </div>
        
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight break-words">{decision.dilemma}</h1>
          {decision.category && (
            <div className="mt-3 flex justify-center">
              <CategoryBadge categoryId={decision.category} />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1 justify-center sm:justify-start">
            <Calendar className="h-4 w-4" />
            {t('sharedDecisionView.sharedOn')} {new Date(sharedDecision.created_at).toLocaleDateString(getLocaleTag())}
          </div>
          <div className="flex items-center gap-1 justify-center sm:justify-start">
            <Eye className="h-4 w-4" />
            {sharedDecision.view_count} {sharedDecision.view_count === 1 ? t('sharedDecisionView.view') : t('sharedDecisionView.views')}
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button onClick={copyShareLink} variant="ghost" size="sm" className="text-xs px-2 py-1">
              <Share2 className="h-3 w-3 mr-1" />
              {t('sharedDecisionView.copyLinkButton')}
            </Button>
            <Button onClick={copyToWorkspace} variant="outline" size="sm" className="text-xs px-2 py-1">
              <Plus className="h-3 w-3 mr-1" />
              {t('sharedDecisionView.copyToWorkspace')}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Recommendation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-green-600 dark:text-green-400">{t('sharedDecisionView.recommended')}</CardTitle>
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
          <CardTitle>{t('sharedDecisionView.evaluationCriteria')}</CardTitle>
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
            <CardTitle>{t('sharedDecisionView.detailedAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decision.result.breakdown.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-col gap-3 mb-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <h4 className="font-semibold text-lg">{item.option}</h4>
                      <div className="flex items-center gap-1 self-start sm:self-center">
                        <span className="text-xs text-muted-foreground">{t('sharedDecisionView.learnMore')}</span>
                        <ValidatedLink
                          link={{
                            title: `Rechercher ${item.option}`,
                            url: `https://www.google.fr/search?q=${encodeURIComponent(item.option)}`
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">{t('sharedDecisionView.advantages')}</h5>
                      <ul className="text-sm space-y-1">
                        {item.pros.map((pro, idx) => (
                          <li key={idx} className="text-muted-foreground">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{t('sharedDecisionView.disadvantages')}</h5>
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
      {decision.result.shoppingLinks && decision.result.shoppingLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sharedDecisionView.usefulLinks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium mb-3">{t('sharedDecisionView.shoppingLinks')}</h4>
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
          </CardContent>
        </Card>
      )}

      {/* Section des commentaires */}
      <div className="mt-8">
        <Separator className="my-6" />
        <CommentSection 
          decisionId={sharedDecision.decision_data.id} 
          commentType="general"
          title={t('sharedDecisionView.commentsTitle')}
          placeholder={t('sharedDecisionView.commentsPlaceholder')}
        />
      </div>

    </div>
  );
};

export default SharedDecisionView;
