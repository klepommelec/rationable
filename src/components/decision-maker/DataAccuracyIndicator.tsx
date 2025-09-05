import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Database, ChevronDown, ChevronUp } from 'lucide-react';
import { IResult } from '@/types/decision';
import { useI18nUI } from '@/contexts/I18nUIContext';
import { LinkVerifierService } from '@/services/linkVerifierService';

interface DataAccuracyIndicatorProps {
  result: IResult;
  currentDecision?: any;
  className?: string;
}

interface VerifiedSource {
  url: string;
  title?: string;
  status?: 'valid' | 'invalid' | 'redirect' | 'timeout' | 'pending';
  finalUrl?: string;
  error?: string;
}

export const DataAccuracyIndicator: React.FC<DataAccuracyIndicatorProps> = ({ 
  result, 
  currentDecision,
  className = '' 
}) => {
  const { t, getLocaleTag } = useI18nUI();
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [verifiedSources, setVerifiedSources] = useState<VerifiedSource[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [displayedSourceCount, setDisplayedSourceCount] = useState(0);

  // Helper functions for date formatting
  const formatDateOnly = (timestamp: number | string | undefined) => {
    if (!timestamp) return t('dataAccuracy.unknown.date');
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString(getLocaleTag(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (timestamp: number | string | undefined) => {
    if (!timestamp) return t('dataAccuracy.unknown.datetime');
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString(getLocaleTag(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get creation info
  const creationTimestamp = currentDecision?.timestamp;
  const author = currentDecision?.createdByName || currentDecision?.author || t('dataAccuracy.unknown.author');

  // Get update info
  const updateTimestamp = currentDecision?.updatedAt || result.realTimeData?.timestamp;
  const updatedBy = currentDecision?.updatedByName || currentDecision?.updatedBy || t('dataAccuracy.unknown.user');
  const hasUpdates = !!currentDecision?.updatedAt || !!result.realTimeData?.timestamp;

  // Combine all sources for comprehensive display
  const getAllSources = () => {
    const sources: (string | { url: string; title?: string })[] = [
      ...(result.realTimeData?.sources || []),
      ...(result.workspaceData?.documentSources || []),
      ...(result.infoLinks?.map(link => ({ url: link.url, title: link.title })) || [])
    ];
    
    // Deduplicate by URL
    const uniqueUrls = new Set<string>();
    return sources.filter(source => {
      const url = typeof source === 'string' ? source : source.url;
      if (uniqueUrls.has(url)) return false;
      uniqueUrls.add(url);
      return true;
    }).map(source => typeof source === 'string' ? { url: source, title: undefined } : source);
  };
  
  const allSources = getAllSources();
  
  // Update displayed source count when verification completes
  useEffect(() => {
    if (verifiedSources.length === 0) {
      setDisplayedSourceCount(allSources.length);
    } else {
      const validCount = verifiedSources.filter(source => 
        ['valid', 'redirect'].includes(source.status || 'valid')
      ).length;
      setDisplayedSourceCount(validCount);
    }
  }, [verifiedSources, allSources.length]);

  // Verify sources when expanded
  const handleSourcesExpand = async (expanded: boolean) => {
    setIsSourcesExpanded(expanded);
    
    if (expanded && allSources.length > 0 && verifiedSources.length === 0) {
      setIsVerifying(true);
      try {
        const linksToVerify = allSources.map(source => ({
          url: source.url,
          title: source.title || '',
          description: ''
        }));
        
        const { validLinks, invalidLinks } = await LinkVerifierService.verifyLinks(linksToVerify);
        
        const verified: VerifiedSource[] = allSources.map(source => {
          const validLink = validLinks.find(v => v.url === source.url);
          const invalidLink = invalidLinks.find(i => i.url === source.url);
          
          if (validLink) {
            return {
              ...source,
              status: 'valid' as const,
              finalUrl: validLink.url
            };
          } else if (invalidLink) {
            return {
              ...source,
              status: invalidLink.status as any,
              error: invalidLink.error
            };
          } else {
            return {
              ...source,
              status: 'valid' as const
            };
          }
        });
        
        setVerifiedSources(verified);
      } catch (error) {
        console.error('Source verification failed:', error);
        // Fallback to unverified sources
        setVerifiedSources(allSources.map(source => ({ ...source, status: 'valid' as const })));
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-2 ${className}`}>
        <Collapsible open={isSourcesExpanded} onOpenChange={handleSourcesExpand}>
          {/* Layout mobile : structure verticale en 3 niveaux */}
          <div className="block sm:hidden px-1">
            <div className="space-y-1 text-xs text-muted-foreground">
              {/* 1er niveau: Créé le (date) par (auteur) */}
              <div className="flex flex-wrap items-center gap-x-1">
                <span>{t('dataAccuracy.createdOn')}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">
                      {formatDateOnly(creationTimestamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('dataAccuracy.createdOn')} {formatDateTime(creationTimestamp)} {t('dataAccuracy.by')} {author}</p>
                  </TooltipContent>
                </Tooltip>
                <span>{t('dataAccuracy.by')} {author}</span>
              </div>
              
              {/* 2ème niveau: Mis à jour le (date) si ça existe */}
              {hasUpdates && (
                <div className="flex flex-wrap items-center gap-x-1">
                  <span>{t('dataAccuracy.updatedOn')}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline decoration-dotted cursor-help">
                        {formatDateOnly(updateTimestamp)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('dataAccuracy.updatedOn')} {formatDateTime(updateTimestamp)} {t('dataAccuracy.by')} {updatedBy}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
            
            {/* 3ème niveau: Badge sources aligné à gauche */}
            <div className="mt-2">
              <CollapsibleTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer flex items-center gap-2 hover:bg-muted w-fit"
                 >
                  <Database className="h-3 w-3" />
                   {!isVerifying && verifiedSources.length === 0 ? 
                    t('dataAccuracy.viewSources') : 
                    isVerifying ? 'Vérification...' :
                    `${displayedSourceCount} ${displayedSourceCount > 1 ? t('dataAccuracy.sources.other') : t('dataAccuracy.sources.one')}`
                  }
                  {isSourcesExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Badge>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Layout desktop : horizontal comme avant */}
          <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                <span className="flex-shrink-0">{t('dataAccuracy.createdOn')}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help flex-shrink-0">
                      {formatDateOnly(creationTimestamp)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('dataAccuracy.createdOn')} {formatDateTime(creationTimestamp)} {t('dataAccuracy.by')} {author}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="flex-shrink-0">{t('dataAccuracy.by')}</span>
                <span className="truncate min-w-0" title={author}>{author}</span>
                {hasUpdates && (
                  <>
                    <span className="flex-shrink-0">, {t('dataAccuracy.updatedOn')}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="underline decoration-dotted cursor-help flex-shrink-0">
                          {formatDateOnly(updateTimestamp)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('dataAccuracy.updatedOn')} {formatDateTime(updateTimestamp)} {t('dataAccuracy.by')} {updatedBy}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <Badge 
                variant="secondary" 
                className="flex-shrink-0 cursor-pointer flex items-center gap-2 hover:bg-muted"
               >
                <Database className="h-3 w-3" />
                {!isVerifying && verifiedSources.length === 0 ? 
                  t('dataAccuracy.viewSources') : 
                  isVerifying ? 'Vérification...' :
                  `${displayedSourceCount} ${displayedSourceCount > 1 ? t('dataAccuracy.sources.other') : t('dataAccuracy.sources.one')}`
                }
                {isSourcesExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Badge>
            </CollapsibleTrigger>
          </div>

          {/* Sources Content - Below when expanded */}
          <CollapsibleContent className="mt-2">
            <div className="space-y-2 pl-2 border-l-2 border-muted">
              {allSources.length === 0 ? (
                <div className="text-xs text-muted-foreground">{t('dataAccuracy.noExternalSources')}</div>
              ) : isVerifying ? (
                <div className="text-xs text-muted-foreground">Vérification des sources...</div>
              ) : (
                (verifiedSources.length > 0 ? verifiedSources : allSources)
                  .filter(source => {
                    const verified = verifiedSources.find(v => v.url === source.url);
                    return !verified || ['valid', 'redirect'].includes(verified.status || 'valid');
                  })
                  .map((source, index) => {
                    const verified = verifiedSources.find(v => v.url === source.url);
                    const finalUrl = verified?.finalUrl || source.url;
                    
                    return (
                      <div key={index} className="text-xs">
                        <a 
                          href={finalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Database className="h-3 w-3" />
                          {source.title || (finalUrl.length > 50 ? `${finalUrl.substring(0, 50)}...` : finalUrl)}
                        </a>
                      </div>
                    );
                  })
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  );
};