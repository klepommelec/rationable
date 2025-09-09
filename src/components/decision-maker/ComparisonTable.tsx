import React, { useState, useEffect } from 'react';
import { IBreakdownItem, IResult } from '@/types/decision';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink, ShoppingBag, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateOptionSearchLinks } from '@/services/expandOptionsService';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { handleExternalLinkClick } from '@/utils/navigation';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
  result?: IResult; // Pour accéder au cache et le mettre à jour
  onUpdateResult?: (updatedResult: IResult) => void; // Callback pour sauvegarder les liens en cache
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma,
  result,
  onUpdateResult
}) => {
  const { t } = useI18nUI();
  const [actionLinks, setActionLinks] = useState<Record<string, BestLinksResponse | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  // Lazy load action links only for recommended option
  useEffect(() => {
    if (!breakdown?.length || !dilemma) return;

    // Only load action links for the first (recommended) option
    const recommendedOption = breakdown[0];
    if (recommendedOption) {
      const optionKey = recommendedOption.option;
      
      // Éviter de recharger si les liens sont déjà présents (cache ou état local)
      if (result?.cachedActionLinks?.[optionKey] || actionLinks[optionKey]) {
        if (result?.cachedActionLinks?.[optionKey] && !actionLinks[optionKey]) {
          console.log(`✅ Using cached action links for ${optionKey}`);
          setActionLinks(prev => ({
            ...prev,
            [optionKey]: result.cachedActionLinks[optionKey]
          }));
        }
        return;
      }

      // Éviter de recharger si déjà en cours de chargement
      if (loadingStates[optionKey]) return;

      console.log(`🔍 Loading action links for ${optionKey} (not cached)`);
      setLoadingStates(prev => ({
        ...prev,
        [optionKey]: true
      }));
      firstResultService.getBestLinks({
        optionName: recommendedOption.option,
        dilemma: dilemma,
        language: detectedLanguage,
        vertical: detectedVertical as any
      }).then(linksResult => {
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: linksResult
        }));
        
        // Sauvegarder dans le cache
        if (result && onUpdateResult) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [optionKey]: linksResult
            }
          };
          console.log(`💾 Caching action links for ${optionKey}`);
          onUpdateResult(updatedResult);
        }
      }).catch(error => {
        console.error(`Failed to get action links for ${optionKey}:`, error);
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: null
        }));
      }).finally(() => {
        setLoadingStates(prev => ({
          ...prev,
          [optionKey]: false
        }));
      });
    }
  }, [breakdown, dilemma, detectedLanguage, detectedVertical]);

  // Lazy load action links for other options on demand
  const loadActionLinksForOption = async (option: IBreakdownItem) => {
    const optionKey = option.option;
    if (actionLinks[optionKey] !== undefined || loadingStates[optionKey]) return;
    
    // Vérifier le cache d'abord
    if (result?.cachedActionLinks?.[optionKey]) {
      console.log(`✅ Using cached action links for ${optionKey}`);
      setActionLinks(prev => ({
        ...prev,
        [optionKey]: result.cachedActionLinks[optionKey]
      }));
      return;
    }

    console.log(`🔍 Loading action links for ${optionKey} (not cached)`);
    setLoadingStates(prev => ({
      ...prev,
      [optionKey]: true
    }));
    try {
      const linksResult = await firstResultService.getBestLinks({
        optionName: option.option,
        dilemma: dilemma || '',
        language: detectedLanguage,
        vertical: detectedVertical as any
      });
      setActionLinks(prev => ({
        ...prev,
        [optionKey]: linksResult
      }));
      
      // Sauvegarder dans le cache
      if (result && onUpdateResult) {
        const updatedResult = {
          ...result,
          cachedActionLinks: {
            ...result.cachedActionLinks,
            [optionKey]: linksResult
          }
        };
        console.log(`💾 Caching action links for ${optionKey}`);
        onUpdateResult(updatedResult);
      }
    } catch (error) {
      console.error(`Failed to get action links for ${optionKey}:`, error);
      setActionLinks(prev => ({
        ...prev,
        [optionKey]: null
      }));
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [optionKey]: false
      }));
    }
  };

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>{t('decision.noResults')}</p>
      </div>
    );
  }

  // Garder l'ordre original des options (plus de tri par score)
  const sortedOptions = [...breakdown];

  // Afficher le tableau même avec une seule option
  if (sortedOptions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>{t('decision.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px] border-r">Option</TableHead>
              <TableHead className="border-r">{t('decision.advantages')}</TableHead>
              <TableHead className="border-r">{t('decision.disadvantages')}</TableHead>
              <TableHead className="w-[180px]">{t('decision.learnMore')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOptions.map((option, index) => {
              const searchLinks = generateOptionSearchLinks(option.option, dilemma || '');
              const optionKey = option.option;
              const optionActionLinks = actionLinks?.[optionKey] || null;
              const isLoading = loadingStates?.[optionKey] || false;

              return (
                <TableRow 
                  key={index} 
                  className={index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''} 
                  onMouseEnter={() => index > 0 && loadActionLinksForOption(option)}
                >
                  <TableCell className="font-medium align-top border-r">
                    <div className="flex flex-col gap-3">
                      {index === 0 && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap w-fit">
                          {t('decision.recommended')}
                        </Badge>
                      )}
                      <span className="text-sm font-medium">
                        {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                      </span>
                      
                      {/* Action buttons - only show for recommended option or when loaded */}
                      {(index === 0 || actionLinks[optionKey]) && (
                        <div className="mt-2">
                          {isLoading ? (
                            <Button variant="secondary" size="sm" disabled className="w-full text-xs h-7">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {I18nService.getSearchingLabel(detectedLanguage)}
                            </Button>
                          ) : optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                            <div className="flex flex-col gap-2">
                              {/* Primary button: Based on action type */}
                              {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                                <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs max-w-[120px] truncate h-7">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    {I18nService.getDirectionsLabel(detectedLanguage)}
                                  </Button>
                                </a>
                              ) : optionActionLinks.official ? (
                                <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs max-w-[120px] truncate h-7">
                                    <MerchantLogo url={optionActionLinks.official.url} size={14} className="mr-1" />
                                    {I18nService.getOfficialSiteLabel(detectedLanguage)}
                                  </Button>
                                </a>
                              ) : optionActionLinks.merchants?.[0] ? (
                                <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs max-w-[120px] truncate h-7">
                                    <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="mr-1" />
                                    {optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}
                                  </Button>
                                </a>
                              ) : null}
                             
                              {/* Secondary buttons: Merchants */}
                              {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                                <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="secondary" size="sm" className="text-xs max-w-[120px] truncate h-7">
                                    <MerchantLogo url={merchant.url} size={14} className="mr-1" />
                                    {firstResultService.getDomainLabel(merchant.domain)}
                                  </Button>
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top vertical-align-top border-r">
                    <div className="space-y-1">
                      {option.pros?.slice(0, 3).map((pro, proIndex) => (
                        <div key={proIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{pro}</span>
                        </div>
                      ))}
                      {option.pros?.length > 3 && (
                        <p className="text-xs text-muted-foreground italic">
                          +{option.pros.length - 3} {t('decision.moreAdvantages')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top vertical-align-top border-r">
                    <div className="space-y-1">
                      {option.cons?.slice(0, 3).map((con, conIndex) => (
                        <div key={conIndex} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{con}</span>
                        </div>
                      ))}
                      {option.cons?.length > 3 && (
                        <p className="text-xs text-muted-foreground italic">
                          +{option.cons.length - 3} {t('decision.moreDisadvantages')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      {searchLinks.slice(0, 2).map((link, i) => (
                        <Button 
                          key={i} 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs" 
                          onClick={e => handleExternalLinkClick(e, link.url)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {link.title.replace(`"${option.option}"`, '').trim() || t('decision.search')}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground text-center sr-only">
        {t('decision.comparisonTableCaption').replace('{count}', sortedOptions.length.toString())}
      </div>
    </div>
  );
};