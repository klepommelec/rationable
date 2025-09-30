import React, { useState, useEffect } from 'react';
import { IBreakdownItem, IResult } from '@/types/decision';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { actionLinksCacheService } from '@/services/actionLinksCacheService';
import { loadActionLinksFromCache, preloadAllActionLinks } from '@/utils/actionLinksLoader';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';
import { useI18nUI } from '@/contexts/I18nUIContext';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
  result?: IResult;
  onUpdateResult?: (updatedResult: IResult) => void;
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
  const [expandedPros, setExpandedPros] = useState<Record<string, boolean>>({});
  const [expandedCons, setExpandedCons] = useState<Record<string, boolean>>({});
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  // Auto load action links for all options
  useEffect(() => {
    if (!breakdown?.length || !dilemma) return;

    // Load action links for all options automatically
    breakdown.forEach((option, index) => {
      const optionKey = option.option;
      
      // Vérifier si on a déjà tenté de charger cette option (succès ou échec)
      const hasCachedResult = result?.cachedActionLinks && result.cachedActionLinks.hasOwnProperty(optionKey);
      const hasLocalResult = actionLinks.hasOwnProperty(optionKey);
      
      // Si on a déjà un résultat local, ne pas recharger
      if (hasLocalResult) {
        return;
      }

      // Essayer de charger depuis le cache (local ou persistant)
      const cachedLinks = loadActionLinksFromCache({
        optionName: optionKey,
        dilemma: dilemma || '',
        result,
        onUpdateResult
      });
      
      if (cachedLinks) {
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: cachedLinks
        }));
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
        optionName: option.option,
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
        
        // Créer une sentinelle pour indiquer l'échec
        const failureSentinel: BestLinksResponse = {
          official: undefined,
          merchants: [],
          maps: undefined,
          actionType: 'buy',
          provider: 'google_cse',
          fromCache: true
        };
        
        setActionLinks(prev => ({
          ...prev,
          [optionKey]: failureSentinel
        }));
        
        // Sauvegarder l'échec dans le cache pour éviter de re-essayer
        if (result && onUpdateResult) {
          const updatedResult = {
            ...result,
            cachedActionLinks: {
              ...result.cachedActionLinks,
              [optionKey]: failureSentinel
            }
          };
          console.log(`💾 Caching failure for ${optionKey}`);
          onUpdateResult(updatedResult);
        }
      }).finally(() => {
        setLoadingStates(prev => ({
          ...prev,
          [optionKey]: false
        }));
      });
    });
  }, [breakdown, dilemma, detectedLanguage, detectedVertical, result?.cachedActionLinks]);


  // Fonctions pour gérer l'expansion des avantages et inconvénients
  const toggleProsExpansion = (optionKey: string) => {
    setExpandedPros(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
  };

  const toggleConsExpansion = (optionKey: string) => {
    setExpandedCons(prev => ({
      ...prev,
      [optionKey]: !prev[optionKey]
    }));
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
    <div className="space-y-4 w-full">
      {/* Version mobile : Cards empilées */}
      <div className="block md:hidden space-y-4">
        {sortedOptions.map((option, index) => {
          const optionKey = option.option;
          const optionActionLinks = actionLinks?.[optionKey] || null;

          return (
            <Card key={index} className={`p-4 ${index === 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : ''}`}>
              <div className="space-y-3">
                {/* Header avec badge recommandé */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {index === 0 && (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs mb-2">
                        {t('decision.recommended')}
                      </Badge>
                    )}
                    <h3 className="font-medium text-sm leading-tight">
                      {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                    </h3>
                  </div>
                </div>

                {/* Boutons d'action - Search toujours en premier */}
                <div className="flex flex-wrap gap-2">
                  {/* Bouton Search - toujours présent */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => {
                      const searchQuery = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {t('decision.search')}
                  </Button>

                  {/* Liens intelligents - seulement si disponibles */}
                  {optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                    <>
                      {/* Primary button: Based on action type */}
                      {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                        <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <Navigation className="h-3 w-3 mr-1" />
                            {I18nService.getDirectionsLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : optionActionLinks.official ? (
                        <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <MerchantLogo url={optionActionLinks.official.url} size={14} className="mr-1" />
                            {I18nService.getOfficialSiteLabel(detectedLanguage)}
                          </Button>
                        </a>
                      ) : optionActionLinks.merchants?.[0] ? (
                        <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="mr-1" />
                            {optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}
                          </Button>
                        </a>
                      ) : null}
                      
                      {/* Secondary buttons: Merchants */}
                      {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                        <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm" className="text-xs h-7">
                            <MerchantLogo url={merchant.url} size={14} className="mr-1" />
                            {firstResultService.getDomainLabel(merchant.domain)}
                          </Button>
                        </a>
                      ))}
                    </>
                  ) : null}
                </div>

                {/* Avantages et Inconvénients en deux colonnes */}
                {(option.pros?.length > 0 || option.cons?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Avantages */}
                    {option.pros && option.pros.length > 0 && (
                      <div>
                        <ul className="space-y-1">
                          {(expandedPros[optionKey] ? option.pros : option.pros.slice(0, 3)).map((pro, proIndex) => (
                            <li key={proIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                          {option.pros.length > 3 && (
                            <button
                              onClick={() => toggleProsExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                            >
                              {expandedPros[optionKey] 
                                ? t('decision.seeLess') 
                                : `+${option.pros.length - 3} more`
                              }
                            </button>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Inconvénients */}
                    {option.cons && option.cons.length > 0 && (
                      <div>
                        <ul className="space-y-1">
                          {(expandedCons[optionKey] ? option.cons : option.cons.slice(0, 3)).map((con, conIndex) => (
                            <li key={conIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                          {option.cons.length > 3 && (
                            <button
                              onClick={() => toggleConsExpansion(optionKey)}
                              className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                            >
                              {expandedCons[optionKey] 
                                ? t('decision.seeLess') 
                                : `+${option.cons.length - 3} more`
                              }
                            </button>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Version desktop : Tableau */}
      <div className="hidden md:block">
        <div className="rounded-md border w-full table-scroll-container">
          <Table className="comparison-table" style={{ minWidth: '800px' }}>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[300px] border-r" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  Option
                </TableHead>
                <TableHead 
                  className="w-[300px] border-r" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  {t('decision.advantages')}
                </TableHead>
                <TableHead 
                  className="w-[300px]" 
                  style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                  {t('decision.disadvantages')}
                </TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {sortedOptions.map((option, index) => {
              const optionKey = option.option;
              const optionActionLinks = actionLinks?.[optionKey] || null;

              return (
                <TableRow 
                  key={index} 
                  className={index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}
                >
                  <TableCell className="font-medium align-top border-r" style={{ padding: '20px' }}>
                    <div className="space-y-4">
                      {index === 0 && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                          {t('decision.recommended')}
                        </Badge>
                      )}
                      <div className="text-sm font-medium">
                        {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                      </div>
                      
                      {/* Action buttons - Search toujours en premier */}
                      <div className="mt-6 w-full">
                        <div className="flex flex-col gap-1 w-full">
                          {/* Bouton Search - toujours présent */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs w-full h-7"
                            onClick={() => {
                              const searchQuery = option.option.replace(/^Option\s+\d+:\s*/i, '').trim();
                              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{t('decision.search')}</span>
                          </Button>

                          {/* Liens intelligents - seulement si disponibles */}
                          {optionActionLinks && (optionActionLinks.official || optionActionLinks.merchants && optionActionLinks.merchants.length > 0 || optionActionLinks.maps) ? (
                            <>
                              {/* Primary button: Based on action type */}
                              {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                                <a href={optionActionLinks.maps.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 truncate">
                                    <Navigation className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{I18nService.getDirectionsLabel(detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : optionActionLinks.official ? (
                                <a href={optionActionLinks.official.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 truncate">
                                    <MerchantLogo url={optionActionLinks.official.url} size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{I18nService.getOfficialSiteLabel(detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : optionActionLinks.merchants?.[0] ? (
                                <a href={optionActionLinks.merchants[0].url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="text-xs w-full h-7 truncate">
                                    <MerchantLogo url={optionActionLinks.merchants[0].url} size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{optionActionLinks.actionType === 'reserve' ? I18nService.getReserveLabel(detectedLanguage) : firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)}</span>
                                  </Button>
                                </a>
                              ) : null}
                             
                              {/* Secondary buttons: Merchants */}
                              {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? optionActionLinks.merchants || [] : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                                <a key={i} href={merchant.url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="secondary" size="sm" className="text-xs w-full h-7 truncate">
                                    <MerchantLogo url={merchant.url} size={14} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{firstResultService.getDomainLabel(merchant.domain)}</span>
                                  </Button>
                                </a>
                              ))}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="align-top border-r" style={{ padding: '20px' }}>
                    <div className="space-y-2">
                      {(expandedPros[optionKey] ? option.pros : option.pros?.slice(0, 3))?.map((pro, proIndex) => (
                        <div key={proIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{pro}</span>
                        </div>
                      ))}
                      {option.pros?.length > 3 && (
                        <button
                          onClick={() => toggleProsExpansion(optionKey)}
                          className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                        >
                          {expandedPros[optionKey] 
                            ? t('decision.seeLess') 
                            : `+${option.pros.length - 3} more`
                          }
                        </button>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="align-top" style={{ padding: '20px' }}>
                    <div className="space-y-2">
                      {(expandedCons[optionKey] ? option.cons : option.cons?.slice(0, 3))?.map((con, conIndex) => (
                        <div key={conIndex} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{con}</span>
                        </div>
                      ))}
                      {option.cons?.length > 3 && (
                        <button
                          onClick={() => toggleConsExpansion(optionKey)}
                          className="text-xs text-muted-foreground italic hover:text-foreground hover:underline transition-colors cursor-pointer"
                        >
                          {expandedCons[optionKey] 
                            ? t('decision.seeLess') 
                            : `+${option.cons.length - 3} more`
                          }
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
      
    <div className="text-xs text-muted-foreground text-center sr-only">
      {t('decision.comparisonTableCaption').replace('{count}', sortedOptions.length.toString())}
    </div>
  </div>
  );
};