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
import { ExternalLink, Lightbulb, CheckCircle, XCircle, ShoppingBag, Loader2, Navigation, Search, Edit3 } from 'lucide-react';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { ExpandableText } from '@/components/ExpandableText';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { actionLinksCacheService } from '@/services/actionLinksCacheService';
import { loadActionLinksFromCache } from '@/utils/actionLinksLoader';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';
import { UsefulLinks } from './UsefulLinks';
import { generateOptionSearchLinks } from '@/services/expandOptionsService';
import { handleExternalLinkClick } from '@/utils/navigation';
interface RecommendationCardProps {
  result: IResult;
  dilemma: string;
  currentDecision: any;
  onEditOptions?: () => void;
  onUpdateResult?: (updatedResult: IResult) => void;
}
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  result,
  dilemma,
  currentDecision,
  onEditOptions,
  onUpdateResult
}) => {
  const {
    t
  } = useI18nUI();
  const topOption = result.breakdown?.[0];
  const [actionLinks, setActionLinks] = useState<BestLinksResponse | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  // Load action links for the top option
  useEffect(() => {
    const loadActionLinks = async () => {
      if (!result?.breakdown?.[0]) return;
      
      const topOption = result.breakdown[0];
      
      // Essayer de charger depuis le cache (local ou persistant)
      console.log(`🔍 RecommendationCard: Loading action links for "${topOption.option}"`);
      console.log(`🔍 RecommendationCard: Has local cache:`, !!result?.cachedActionLinks?.[topOption.option]);
      
      const cachedLinks = loadActionLinksFromCache({
        optionName: topOption.option,
        dilemma,
        result,
        onUpdateResult
      });
      
      if (cachedLinks) {
        console.log(`✅ RecommendationCard: Using cached links for "${topOption.option}"`);
        setActionLinks(cachedLinks);
        setLoadingLinks(false);
        return;
      }
      
      console.log(`⚠️ RecommendationCard: No cached links found for "${topOption.option}", loading from API`);
      
      try {
        setLoadingLinks(true);
        const links = await firstResultService.getBestLinks({
          optionName: topOption.option,
          dilemma: dilemma,
          language: detectedLanguage,
          vertical: detectedVertical
        });
        setActionLinks(links);
        
        // Sauvegarder dans le cache local pour la cohérence
        if (onUpdateResult && result) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [topOption.option]: links
            }
          };
          onUpdateResult(updatedResult);
        }
      } catch (error) {
        console.error('Error loading action links:', error);
        
        // Store negative cache to prevent re-attempts
        const negativeCache = {
          official: undefined,
          merchants: [],
          maps: undefined,
          actionType: 'buy' as const,
          provider: 'error' as any,
          fromCache: true
        };
        setActionLinks(negativeCache);
        
        // Sauvegarder l'échec dans le cache local
        if (onUpdateResult && result) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [topOption.option]: negativeCache
            }
          };
          onUpdateResult(updatedResult);
        }
      } finally {
        setLoadingLinks(false);
      }
    };

    loadActionLinks();
  }, [result?.breakdown, result?.cachedActionLinks, dilemma, onUpdateResult]);

  // Configuration unifiée pour tous les types de résultats (vert aligné sur la ligne recommandée de la ComparisonTable)
  const config = {
    icon: <Lightbulb className="h-5 w-5 text-primary" />,
    title: t('decision.title'),
    badge: t('decision.recommended'),
    borderColor: 'border-primary',
    bgGradient: '',
    badgeColor: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    titleColor: 'text-primary'
  };
  
  // Détecter si la card est "vide" (pas de description, avantages, inconvénients)
  const isCardEmpty = !topOption?.description || 
    topOption.description.trim() === '' ||
    (!topOption.pros?.length && !topOption.cons?.length);
  
  return <Card className={`${config.bgGradient} w-full shadow-none bg-transparent border-0`}>
      <CardContent className="px-0 py-0 space-y-6">
        <div className="flex flex-col gap-6">
          <div className="w-full space-y-6 bg-transparent px-0" style={{ boxSizing: 'border-box' }}>
            {/* Layout mobile : badge centré */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${config.badgeColor} w-fit`}>
                  {config.badge}
                </Badge>
                {/* Bouton Modifier options pour les décisions manuelles - mobile */}
                {onEditOptions && result.recommendation?.includes(t('decision.manualOptions.manualAnalysisDescription')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditOptions}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                        {t('decision.manualOptions.modify')}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Layout desktop : badge simple */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${config.badgeColor}`}>
                  {config.badge}
                </Badge>
                {/* Bouton Modifier options pour les décisions manuelles */}
                {onEditOptions && result.recommendation?.includes(t('decision.manualOptions.manualAnalysisDescription')) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditOptions}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                        {t('decision.manualOptions.editOptions')}
                  </Button>
                )}
              </div>
            </div>
            
            <h2 className={`text-2xl font-semibold leading-snug ${config.titleColor} w-full max-w-full sm:max-w-[75%]`}>
              {topOption?.option || result.recommendation?.replace(/^Option\s+\d+:\s*/i, '').trim()}
            </h2>
            
            <div className="w-full">
              <ConfidenceIndicator breakdown={result.breakdown} topOption={topOption} result={result} />
            </div>
            
            {/* Même source que le tableau de comparaison : uniquement la description de l'option (breakdown) pour cohérence */}
            {topOption?.description?.trim() && (
              <div className="w-full mt-6">
                <ExpandableText text={topOption.description} />
              </div>
            )}

            {topOption && (topOption.pros?.length > 0 || topOption.cons?.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4 w-full py-[8px] mt-6">
                {/* Avantages - affiché seulement s'il y a des avantages */}
                {topOption.pros?.length > 0 && (
                  <div>
                    <ul className="space-y-1">
                      {topOption.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Points d'attention - affiché seulement s'il y a des inconvénients */}
                {topOption.cons?.length > 0 && (
                  <div>
                    <ul className="space-y-1">
                      {topOption.cons.map((con, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons for top option - moved to bottom */}
            {topOption?.option && <div className="w-full pt-0 mt-8 mb-8">{/* Spacing: pt-0 mt-8 mb-8 */}
                <div className="flex flex-wrap gap-3">
                  {/* Search button - always visible immediately */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center gap-1.5 min-w-[100px]"
                    onClick={e => {
                      const searchLinks = generateOptionSearchLinks(topOption.option, dilemma);
                      if (searchLinks.length > 0) {
                        handleExternalLinkClick(e, searchLinks[0].url);
                      }
                    }}
                    aria-label={`${t('common.search')} ${topOption.option.replace(/^Option\s+\d+:\s*/i, '').trim()}`}
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span>{t('common.search')}</span>
                  </Button>

                  {/* Intelligent action links - only show when loaded */}
                  {actionLinks && (actionLinks.official || actionLinks.merchants && actionLinks.merchants.length > 0 || actionLinks.maps) ? (
                    <>
                      {/* Primary button: Based on action type */}
                      {actionLinks.actionType === 'directions' && actionLinks.maps ? (
                        <a href={actionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Navigation className="h-4 w-4 mr-2" />
                            {I18nService.getDirectionsLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : actionLinks.official ? (
                        <a href={actionLinks.official.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <MerchantLogo url={actionLinks.official.url} size={20} className="mr-2" />
                            {I18nService.getOfficialSiteLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : actionLinks.merchants[0] ? (
                        <a href={actionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <MerchantLogo url={actionLinks.merchants[0].url} size={20} className="mr-2" />
                            {actionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical, detectedLanguage)} sur {firstResultService.getDomainLabel(actionLinks.merchants[0].domain)}
                          </Button>
                        </a>
                      ) : null}
                      
                      {/* Secondary buttons: Merchants (excluding already shown ones) */}
                      {actionLinks.merchants.filter((merchant, index) => {
                        // If we have directions as primary, show all merchants
                        if (actionLinks.actionType === 'directions') return true;
                        // If we have an official site, show all merchants
                        if (actionLinks.official) return true;
                        // If no official site, skip the first merchant (already shown as primary)
                        return index > 0;
                      }).filter((merchant, index, filteredArray) => {
                        // Remove duplicates based on domain
                        return filteredArray.findIndex(m => m.domain === merchant.domain) === index;
                      }).slice(0, 2).map((merchant, i) => (
                        <a key={`merchant-${merchant.domain}-${i}`} href={merchant.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="min-w-[120px]">
                            <MerchantLogo url={merchant.url} size={20} className="mr-2" />
                            {firstResultService.getDomainLabel(merchant.domain)}
                          </Button>
                        </a>
                      ))}
                    </>
                  ) : null}
                </div>
              </div>}

            {/* Useful Links moved inside recommendation card */}
            <div className="w-full pt-0 mt-8 mb-8">
              <UsefulLinks shoppingLinks={result.shoppingLinks} socialContent={result.socialContent} dilemma={dilemma} recommendation={result.recommendation} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};