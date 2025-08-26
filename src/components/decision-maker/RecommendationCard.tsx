import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IResult } from '@/types/decision';

import { ConfidenceIndicator } from './ConfidenceIndicator';
import { DataAccuracyIndicator } from './DataAccuracyIndicator';
import { WorkspaceDocumentIndicator } from './WorkspaceDocumentIndicator';
import { AIProviderIndicator } from './AIProviderIndicator';
import ValidatedLink from '@/components/ValidatedLink';
import { ExternalLink, Lightbulb, CheckCircle, ShoppingBag, Loader2, Navigation } from 'lucide-react';
import { ExpandableText } from '@/components/ExpandableText';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { UsefulLinks } from './UsefulLinks';
interface RecommendationCardProps {
  result: IResult;
  dilemma: string;
  currentDecision: any;
}
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  dilemma,
  currentDecision
}) => {
  const { t } = useI18nUI();
  const topOption = result.breakdown?.[0];
  const [actionLinks, setActionLinks] = useState<BestLinksResponse | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  // Load action button for top option
  useEffect(() => {
    if (!topOption?.option || !dilemma) return;

    const loadActionButton = async () => {
      setIsLoadingAction(true);
      try {
        const result = await firstResultService.getBestLinks({
          optionName: topOption.option,
          dilemma: dilemma,
          language: detectedLanguage,
          vertical: detectedVertical as any
        });
        setActionLinks(result);
      } catch (error) {
        console.error(`Failed to get action links for ${topOption.option}:`, error);
        setActionLinks(null);
      } finally {
        setIsLoadingAction(false);
      }
    };

    loadActionButton();
  }, [topOption?.option, dilemma, detectedLanguage, detectedVertical]);
  
  // Configuration unifiée pour tous les types de résultats
  const config = {
    icon: <Lightbulb className="h-5 w-5 text-primary" />,
    title: t('decision.title'),
    badge: t('decision.recommended'),
    borderColor: 'border-primary/20',
    bgGradient: 'bg-gradient-to-r from-primary/5 to-secondary/5',
    badgeColor: 'bg-primary/10 text-primary',
    titleColor: 'text-primary'
  };

  return <Card className={`border-2 ${config.borderColor} ${config.bgGradient} w-full`}>
      <CardContent className="space-y-6 pt-4 sm:pt-2">
        <div className="flex flex-col gap-6">
          <div className="w-full space-y-4">
            {/* Layout mobile : badge centré */}
            <div className="sm:hidden">
              <Badge variant="secondary" className={`${config.badgeColor} w-fit`}>
                {config.badge}
              </Badge>
            </div>
            
            {/* Layout desktop : badge simple */}
            <div className="hidden sm:block">
              <Badge variant="secondary" className={`${config.badgeColor}`}>
                {config.badge}
              </Badge>
            </div>
            
            <h2 className={`text-2xl font-semibold leading-snug ${config.titleColor} w-full max-w-full sm:max-w-[75%]`}>
              {result.recommendation?.replace(/^Option\s+\d+:\s*/i, '').trim()}
            </h2>
            
            <div className="w-full">
              <ConfidenceIndicator breakdown={result.breakdown} topOption={topOption} result={result} />
            </div>
            
            <div className="w-full">
              <ExpandableText text={result.description} />
            </div>

            {topOption && (topOption.pros?.length > 0 || topOption.cons?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4 w-full">
                {topOption.pros?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {t('decision.advantages')}
                    </h4>
                    <ul className="space-y-1">
                      {topOption.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {topOption.cons?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {t('decision.pointsOfAttention')}
                    </h4>
                    <ul className="space-y-1">
                      {topOption.cons.map((con, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons for top option - moved to bottom */}
            {topOption?.option && (
              <div className="w-full pt-4">{/* Added pt-4 for more spacing */}
                {isLoadingAction ? (
                  <Button variant="secondary" size="sm" disabled className="w-full sm:w-auto">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {I18nService.getSearchingLabel(detectedLanguage)}
                  </Button>
                ) : actionLinks && (actionLinks.official || (actionLinks.merchants && actionLinks.merchants.length > 0) || actionLinks.maps) ? (
                  <div className="flex flex-wrap gap-3">
                    {/* Primary button: Based on action type */}
                    {actionLinks.actionType === 'directions' && actionLinks.maps ? (
                      <a
                        href={actionLinks.maps.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="default" size="sm">
                          <Navigation className="h-4 w-4 mr-2" />
                          {I18nService.getDirectionsLabel(detectedLanguage)}
                        </Button>
                      </a>
                    ) : actionLinks.official ? (
                      <a
                        href={actionLinks.official.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="default" size="sm">
                          <MerchantLogo url={actionLinks.official.url} size={20} className="mr-2" />
                          {I18nService.getOfficialSiteLabel(detectedLanguage)}
                        </Button>
                      </a>
                    ) : actionLinks.merchants[0] ? (
                      <a
                        href={actionLinks.merchants[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="default" size="sm">
                          <MerchantLogo url={actionLinks.merchants[0].url} size={20} className="mr-2" />
                          {actionLinks.actionType === 'reserve' ? 
                            I18nService.getReserveLabel(detectedLanguage) :
                            firstResultService.getActionVerb(detectedVertical, detectedLanguage)
                          } sur {firstResultService.getDomainLabel(actionLinks.merchants[0].domain)}
                        </Button>
                      </a>
                    ) : null}
                    
                     {/* Secondary buttons: Merchants (excluding already shown ones) */}
                     {actionLinks.merchants
                       .filter((merchant, index) => {
                         // If we have directions as primary, show all merchants
                         if (actionLinks.actionType === 'directions') return true;
                         // If we have an official site, show all merchants
                         if (actionLinks.official) return true;
                         // If no official site, skip the first merchant (already shown as primary)
                         return index > 0;
                       })
                       .filter((merchant, index, filteredArray) => {
                         // Remove duplicates based on domain
                         return filteredArray.findIndex(m => m.domain === merchant.domain) === index;
                       })
                       .slice(0, 2)
                       .map((merchant, i) => (
                        <a
                          key={`merchant-${merchant.domain}-${i}`}
                          href={merchant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[120px]"
                          >
                            <MerchantLogo url={merchant.url} size={20} className="mr-2" />
                            {firstResultService.getDomainLabel(merchant.domain)}
                          </Button>
                        </a>
                     ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Useful Links moved inside recommendation card */}
            <div className="w-full pt-4">
              <UsefulLinks 
                shoppingLinks={result.shoppingLinks}
                socialContent={result.socialContent}
                dilemma={dilemma}
                recommendation={result.recommendation}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};