import React, { useState, useEffect } from 'react';
import { IBreakdownItem } from '@/types/decision';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink, ShoppingBag, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateOptionSearchLinks } from '@/services/expandOptionsService';
import { firstResultService, BestLinksResponse } from '@/services/firstResultService';
import { I18nService } from '@/services/i18nService';
import { MerchantLogo } from '@/components/MerchantLogo';

interface ComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  breakdown,
  dilemma
}) => {
  const [actionLinks, setActionLinks] = useState<Record<string, BestLinksResponse | null>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const detectedLanguage = I18nService.getCurrentLanguage();
  const detectedVertical = dilemma ? I18nService.detectVertical(dilemma) : null;

  useEffect(() => {
    if (!breakdown?.length || !dilemma) return;

    // Load action buttons for each option
    breakdown.forEach(async (option) => {
      const optionKey = option.option;
      setLoadingStates(prev => ({ ...prev, [optionKey]: true }));

      try {
        const result = await firstResultService.getBestLinks({
          optionName: option.option,
          dilemma: dilemma,
          language: detectedLanguage,
          vertical: detectedVertical as any
        });

        setActionLinks(prev => ({ ...prev, [optionKey]: result }));
      } catch (error) {
        console.error(`Failed to get action links for ${optionKey}:`, error);
        setActionLinks(prev => ({ ...prev, [optionKey]: null }));
      } finally {
        setLoadingStates(prev => ({ ...prev, [optionKey]: false }));
      }
    });
  }, [breakdown, dilemma, detectedLanguage, detectedVertical]);
  if (!breakdown || breakdown.length === 0) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>Aucune donnée disponible pour le tableau comparatif</p>
      </div>;
  }

  // Garder l'ordre original des options (plus de tri par score)
  const sortedOptions = [...breakdown];

  // Afficher le tableau même avec une seule option
  if (sortedOptions.length === 0) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>Aucune donnée disponible pour le tableau comparatif</p>
      </div>;
  }
  return <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Option</TableHead>
              <TableHead>Avantages</TableHead>
              <TableHead>Inconvénients</TableHead>
              <TableHead className="w-[180px]">En savoir plus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOptions.map((option, index) => {
              const searchLinks = generateOptionSearchLinks(option.option, dilemma || '');
              const optionKey = option.option;
              const optionActionLinks = actionLinks?.[optionKey] || null;
              const isLoading = loadingStates?.[optionKey] || false;
              
              return (
                <TableRow key={index} className={index === 0 ? 'bg-green-50 dark:bg-green-950/30' : ''}>
                  <TableCell className="font-medium align-top">
                    <div className="flex flex-col gap-3">
                      {index === 0 && <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-fit">
                          Recommandé
                        </Badge>}
                      <span className="text-sm font-medium">
                        {option.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                      </span>
                      
                      {/* Action buttons moved here */}
                      <div className="mt-2">
                        {isLoading ? (
                          <Button variant="secondary" size="sm" disabled className="w-full text-xs h-7">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {I18nService.getSearchingLabel(detectedLanguage)}
                          </Button>
                         ) : optionActionLinks && (optionActionLinks.official || (optionActionLinks.merchants && optionActionLinks.merchants.length > 0) || optionActionLinks.maps) ? (
                            <div className="flex flex-col gap-2">
                              {/* Primary button: Based on action type */}
                              {optionActionLinks.actionType === 'directions' && optionActionLinks.maps ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(optionActionLinks.maps!.url, '_blank')}
                                  className="text-xs max-w-[120px] truncate h-7"
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  {I18nService.getDirectionsLabel(detectedLanguage)}
                                </Button>
                              ) : optionActionLinks.official ? (
                                <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => window.open(optionActionLinks.official!.url, '_blank')}
                                   className="text-xs max-w-[120px] truncate h-7"
                                 >
                                   <MerchantLogo url={optionActionLinks.official!.url} size={12} className="mr-1" />
                                   {I18nService.getOfficialSiteLabel(detectedLanguage)}
                                 </Button>
                              ) : optionActionLinks.merchants?.[0] ? (
                                <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => window.open(optionActionLinks.merchants?.[0]?.url, '_blank')}
                                   className="text-xs max-w-[120px] truncate h-7"
                                 >
                                   <MerchantLogo url={optionActionLinks.merchants?.[0]?.url || ''} size={12} className="mr-1" />
                                   {optionActionLinks.actionType === 'reserve' ? 
                                     I18nService.getReserveLabel(detectedLanguage) :
                                     firstResultService.getActionVerb(detectedVertical as any, detectedLanguage)
                                   }
                                 </Button>
                              ) : null}
                             
                              {/* Secondary buttons: Merchants */}
                              {(optionActionLinks.actionType === 'directions' || optionActionLinks.official ? (optionActionLinks.merchants || []) : (optionActionLinks.merchants || []).slice(1)).slice(0, 2).map((merchant, i) => (
                                 <Button
                                   key={i}
                                   variant="secondary"
                                   size="sm"
                                   onClick={() => window.open(merchant.url, '_blank')}
                                   className="text-xs max-w-[120px] truncate h-7"
                                 >
                                   <MerchantLogo url={merchant.url} size={12} className="mr-1" />
                                   {firstResultService.getDomainLabel(merchant.domain)}
                                 </Button>
                              ))}
                           </div>
                          ) : !optionActionLinks?.maps ? (
                             <Button variant="secondary" size="sm" disabled className="text-xs max-w-[120px] truncate h-7">
                               {I18nService.getNoLinkLabel(detectedLanguage)}
                             </Button>
                          ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top vertical-align-top">
                    <div className="space-y-1">
                      {option.pros?.slice(0, 3).map((pro, proIndex) => <div key={proIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{pro}</span>
                        </div>)}
                      {option.pros?.length > 3 && <p className="text-xs text-muted-foreground italic">
                          +{option.pros.length - 3} autres avantages
                        </p>}
                    </div>
                  </TableCell>
                  <TableCell className="align-top vertical-align-top">
                    <div className="space-y-1">
                      {option.cons?.slice(0, 3).map((con, conIndex) => <div key={conIndex} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{con}</span>
                        </div>)}
                      {option.cons?.length > 3 && <p className="text-xs text-muted-foreground italic">
                          +{option.cons.length - 3} autres inconvénients
                        </p>}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      {searchLinks.slice(0, 2).map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {link.title.replace(`"${option.option}"`, '').trim() || 'Rechercher'}
                          </Button>
                        </a>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Tableau comparatif des {sortedOptions.length} options analysées
      </div>
    </div>;
};